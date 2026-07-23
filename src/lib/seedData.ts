const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const initialAppointments = [
  { patientName: "John Doe", time: "09:00 AM", date: getLocalDateString(new Date()), type: "Check-up", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Jane Smith", time: "10:00 AM", date: getLocalDateString(new Date(Date.now() + 86400000)), type: "Follow-up", status: "completed", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Robert Johnson", time: "11:00 AM", date: getLocalDateString(new Date(Date.now() + 172800000)), type: "Consultation", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Emily Davis", time: "02:00 PM", date: getLocalDateString(new Date(Date.now() + 172800000)), type: "Emergency", status: "canceled", doctor: "Dr. Ahmed Fathy" },
];
