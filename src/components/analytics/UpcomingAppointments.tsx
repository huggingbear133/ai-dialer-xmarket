export function UpcomingAppointments({ appointments }: {appointments: any}) {
    return (
      <div className="space-y-4">
        {appointments.map((appointment: any) => (
          <div key={appointment.id} className="p-4 border rounded">
            <h4>{appointment.title}</h4>
            <p>{appointment.date}</p>
          </div>
        ))}
      </div>
    );
  }
  