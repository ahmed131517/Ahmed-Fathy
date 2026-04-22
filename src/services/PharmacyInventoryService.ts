import { db, type PharmacyInventoryItem, type PharmacyBatch } from "@/lib/db";

export class PharmacyInventoryService {
  static async checkLowStock() {
    const items = await db.pharmacy_inventory.where('isDeleted').equals(0).toArray();
    const lowStockItems = items.filter(item => item.stock <= item.minStock);

    for (const item of lowStockItems) {
      // Check if notification already exists for this item today
      const today = new Date().setHours(0, 0, 0, 0);
      const existing = await db.notifications
        .where('category')
        .equals('pharmacy')
        .and(n => n.title.includes(item.medicationName) && n.createdAt >= today)
        .first();

      if (!existing) {
        await db.notifications.add({
          id: crypto.randomUUID(),
          title: `Low Stock: ${item.medicationName}`,
          message: `Current stock (${item.stock} ${item.unit}) is below minimum threshold (${item.minStock} ${item.unit}).`,
          type: 'warning',
          category: 'pharmacy',
          isRead: 0,
          link: '/pharmacy/inventory',
          createdAt: Date.now(),
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        });
      }
    }
  }

  static async checkExpiringBatches() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const batches = await db.pharmacy_batches.where('isDeleted').equals(0).toArray();
    const expiringSoon = batches.filter(batch => {
      const expiry = new Date(batch.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry >= today;
    });

    for (const batch of expiringSoon) {
      const item = await db.pharmacy_inventory.get(batch.inventoryItemId);
      if (!item) continue;

      const todayStart = new Date().setHours(0, 0, 0, 0);
      const existing = await db.notifications
        .where('category')
        .equals('pharmacy')
        .and(n => n.title.includes(batch.batchNumber) && n.createdAt >= todayStart)
        .first();

      if (!existing) {
        await db.notifications.add({
          id: crypto.randomUUID(),
          title: `Expiring Batch: ${item.medicationName}`,
          message: `Batch ${batch.batchNumber} expires on ${new Date(batch.expiryDate).toLocaleDateString()}.`,
          type: 'error',
          category: 'pharmacy',
          isRead: 0,
          link: '/pharmacy/inventory',
          createdAt: Date.now(),
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        });
      }
    }
  }

  static async addBatch(batch: Omit<PharmacyBatch, 'id' | 'lastModified' | 'isDeleted' | 'localId' | 'isSynced'>) {
    const id = crypto.randomUUID();
    await db.pharmacy_batches.add({
      ...batch,
      id,
      lastModified: Date.now(),
      isDeleted: 0,
      isSynced: 0
    });

    // Update total stock in inventory
    const item = await db.pharmacy_inventory.get(batch.inventoryItemId);
    if (item) {
      await db.pharmacy_inventory.update(item.id!, {
        stock: item.stock + batch.quantity,
        lastModified: Date.now(),
        isSynced: 0
      });
    }
    
    return id;
  }
}
