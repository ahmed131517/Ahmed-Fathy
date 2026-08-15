import { db, type PharmacyInventoryItem, type PharmacyBatch } from "@/lib/db";

export class PharmacyInventoryService {
  static async checkLowStock() {
    const items = await db.pharmacy_inventory.toArray().then(arr => arr.filter(x => !x.isDeleted));
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

    const batches = await db.pharmacy_batches.toArray().then(arr => arr.filter(x => !x.isDeleted));
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

  static async ensureSeedBatches() {
    const existingBatches = await db.pharmacy_batches.toArray().then(arr => arr.filter(x => !x.isDeleted));
    if (existingBatches.length > 0) return;

    const inventoryItems = await db.pharmacy_inventory.toArray().then(arr => arr.filter(x => !x.isDeleted));
    if (inventoryItems.length === 0) return;

    const today = new Date();
    
    // Create realistic demo batches for inventory items with varying expiration dates
    for (const item of inventoryItems) {
      const itemId = item.id || String(item.localId);
      const name = item.medicationName.toUpperCase();
      const codePrefix = name.substring(0, 3);

      // Early expiring batch (1 to 2 months away) -> FEFO pick
      const expiry1 = new Date();
      expiry1.setDate(today.getDate() + 35);

      // Later expiring batch (8 to 12 months away)
      const expiry2 = new Date();
      expiry2.setDate(today.getDate() + 270);

      await db.pharmacy_batches.bulkAdd([
        {
          id: crypto.randomUUID(),
          inventoryItemId: itemId,
          batchNumber: `LOT-2026-${codePrefix}01`,
          expiryDate: expiry1.toISOString().split('T')[0],
          quantity: Math.max(10, Math.floor(item.stock * 0.4)),
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        },
        {
          id: crypto.randomUUID(),
          inventoryItemId: itemId,
          batchNumber: `LOT-2026-${codePrefix}02`,
          expiryDate: expiry2.toISOString().split('T')[0],
          quantity: Math.max(15, Math.floor(item.stock * 0.6)),
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        }
      ]);
    }
  }

  static async deductBatchStock(batchId: string, quantityToDeduct: number) {
    const batch = await db.pharmacy_batches.toArray().then(arr => arr.find(x => x.id === batchId));
    if (batch && batch.localId) {
      const newQty = Math.max(0, batch.quantity - quantityToDeduct);
      await db.pharmacy_batches.update(batch.localId, {
        quantity: newQty,
        lastModified: Date.now()
      });

      // Also deduct overall item stock
      const item = await db.pharmacy_inventory.get(batch.inventoryItemId);
      if (item && item.localId) {
        const newTotalStock = Math.max(0, item.stock - quantityToDeduct);
        await db.pharmacy_inventory.update(item.localId, {
          stock: newTotalStock,
          lastModified: Date.now()
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
