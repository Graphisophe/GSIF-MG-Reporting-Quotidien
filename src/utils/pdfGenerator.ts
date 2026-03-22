import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Contact } from '../types';

export function generatePDF(contacts: Contact[], date: string, sensitivePointsSummary: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  const formattedDate = date && !isNaN(new Date(date).getTime()) ? format(new Date(date), 'dd MMMM yyyy', { locale: fr }) : date;

  // Add Header
  doc.setFontSize(22);
  doc.setTextColor(44, 51, 123); // #2C337B
  doc.text('Reporting quotidien', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`GSIF Marthe Gautier - ${formattedDate}`, 14, 30);

  // Table Data
  const tableData = contacts.map(c => {
    const childrenNames = c.children?.map(child => {
      const dateStr = child.birthDate && !isNaN(new Date(child.birthDate).getTime()) 
        ? format(new Date(child.birthDate), 'dd/MM/yy') 
        : 'N/A';
      return `${child.firstName} (${dateStr})`;
    }).join('\n') || '';
    const childrenLevels = c.children?.map(child => child.requestedLevel?.split(' ')[0] || 'N/A').join('\n') || '';
    const phones = `P: ${c.fatherPhone}\nM: ${c.motherPhone}`;

    return [
      c.date && !isNaN(new Date(c.date).getTime()) ? format(new Date(c.date), 'dd/MM/yyyy') : '-',
      c.lastName,
      phones,
      childrenNames,
      childrenLevels,
      c.source,
      c.channel,
      c.interestLevel,
      c.toDo,
      c.appointmentDate && !isNaN(new Date(c.appointmentDate).getTime()) ? format(new Date(c.appointmentDate), 'dd/MM HH:mm') : '-',
      c.status
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Nom parent', 'Téléphones', 'Enfant(s)', 'Niveau(x)', 'Source', 'Echange', "Niveau d'intérêt", 'A faire', 'RDV prévu', 'Statut']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [44, 51, 123], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: 50 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 40, right: 14, bottom: 60, left: 14 },
    styles: { cellPadding: 3, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 30 },
      8: { cellWidth: 25 },
      9: { cellWidth: 25 },
      10: { cellWidth: 20 },
    }
  });

  // Summary Section
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  doc.addPage();
  
  doc.setFontSize(16);
  doc.setTextColor(44, 51, 123);
  doc.text('Résumé du jour', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  const totalRequests = contacts.length;
  const calls = contacts.filter(c => c.channel === 'téléphone').length;
  const messages = contacts.filter(c => c.channel === 'message').length;
  const appointments = contacts.filter(c => c.toDo === 'A rencontrer').length;
  const visits = contacts.filter(c => c.channel === 'visite directe').length;
  const advancedFiles = contacts.filter(c => c.toDo === 'A finaliser').length;

  const summaryItems = [
    `Nombre total de demandes : ${totalRequests}`,
    `Nombre d'appels : ${calls}`,
    `Nombre de messages : ${messages}`,
    `Nombre de rendez-vous fixés : ${appointments}`,
    `Nombre de visites réalisées : ${visits}`,
    `Nombre de dossiers avancés : ${advancedFiles}`
  ];

  let yPos = 30;
  summaryItems.forEach(item => {
    doc.text(`• ${item}`, 14, yPos);
    yPos += 8;
  });

  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(44, 51, 123);
  doc.text('Points sensibles observés :', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  
  const splitText = doc.splitTextToSize(sensitivePointsSummary || 'Aucun point sensible signalé.', 260);
  doc.text(splitText, 14, yPos);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Document généré automatiquement pour la direction - GSIF Marthe Gautier',
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`Reporting_GSIF_MG_${date}.pdf`);
}
