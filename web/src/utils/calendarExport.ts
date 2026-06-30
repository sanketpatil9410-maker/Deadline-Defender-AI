import { Task } from '../types/task';

interface PlanBlock {
  timeSlot: string;
  taskTitle: string;
  description: string;
}

export function exportPlanToICS(blocks: PlanBlock[]): void {
  if (blocks.length === 0) {
    alert('No plan blocks available to export.');
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deadline Defender AI//NONSGML Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  blocks.forEach((block, index) => {
    // Parse timeSlot like "09:00 - 11:00" or similar
    const times = block.timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    let startStr = '';
    let endStr = '';

    if (times) {
      const sh = times[1];
      const sm = times[2];
      const eh = times[3];
      const em = times[4];
      startStr = `${year}${month}${day}T${sh}${sm}00`;
      endStr = `${year}${month}${day}T${eh}${em}00`;
    } else {
      // Default to hour blocks starting at 9 AM if parsing fails
      const startHour = 9 + index;
      const endHour = startHour + 1;
      const sh = startHour.toString().padStart(2, '0');
      const eh = endHour.toString().padStart(2, '0');
      startStr = `${year}${month}${day}T${sh}0000`;
      endStr = `${year}${month}${day}T${eh}0000`;
    }

    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `deadline-defender-${Date.now()}-${index}@deadlinedefender.ai`;

    icsContent += [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${block.taskTitle.replace(/[,;]/g, '\\$&')}`,
      `DESCRIPTION:${block.description.replace(/[,;]/g, '\\$&')} - Defended by Deadline Defender AI`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT10M', // 10 minutes alarm before event
      'ACTION:DISPLAY',
      'DESCRIPTION:Deadline Defender Focus Alert',
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n') + '\r\n';
  });

  icsContent += 'END:VCALENDAR';

  // Trigger file download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Deadline_Defender_War_Room_Plan_${year}-${month}-${day}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
