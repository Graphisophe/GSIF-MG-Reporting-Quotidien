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
  
  doc.setFontSize(18);
  doc.setTextColor(44, 51, 123);
  doc.text('Résumé du jour', 14, 20);

  const totalRequests = contacts.length;

  // Total requests box
  doc.setFillColor(240, 244, 255); // light blue
  doc.setDrawColor(44, 51, 123);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 28, 80, 22, 3, 3, 'DF');
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Total des demandes", 20, 36);
  
  doc.setFontSize(24);
  doc.setTextColor(44, 51, 123);
  doc.text(totalRequests.toString(), 20, 46);

  // Pie charts data
  const statusData = [
    { name: 'Prospect', value: contacts.filter(c => c.status === 'Prospect').length, color: '#3B82F6' },
    { name: 'Converti', value: contacts.filter(c => c.status === 'Converti').length, color: '#10B981' },
    { name: 'Non-converti', value: contacts.filter(c => c.status === 'Non-converti').length, color: '#64748B' },
  ].filter(d => d.value > 0);

  const channelData = [
    { name: 'Téléphone', value: contacts.filter(c => c.channel === 'téléphone').length, color: '#6CAB65' },
    { name: 'Message', value: contacts.filter(c => c.channel === 'message').length, color: '#6CABC6' },
    { name: 'Rencontre', value: contacts.filter(c => c.channel === 'rencontre').length, color: '#E9454C' },
  ].filter(d => d.value > 0);

  const SOURCE_COLORS = ['#2C337B', '#E9454C', '#F6A650', '#6CAB65', '#6CABC6', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];
  const sourceData = [
    { name: 'Facebook', value: contacts.filter(c => c.source === 'Facebook').length },
    { name: 'Instagram', value: contacts.filter(c => c.source === 'Instagram').length },
    { name: 'Radio', value: contacts.filter(c => c.source === 'Radio').length },
    { name: 'Mall of Sousse', value: contacts.filter(c => c.source === 'Mall of Sousse').length },
    { name: 'Parrainage', value: contacts.filter(c => c.source === 'Parrainage').length },
    { name: 'Site web', value: contacts.filter(c => c.source === 'Site web').length },
    { name: 'Affichage', value: contacts.filter(c => c.source === 'Affichage').length },
    { name: 'JPO', value: contacts.filter(c => c.source === 'JPO').length },
    { name: 'Bouche à oreille', value: contacts.filter(c => c.source === 'Bouche à oreille').length },
  ].filter(d => d.value > 0).map((d, i) => ({ ...d, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }));

  // Helper function to draw pie chart
  const drawPieChartWithLegend = (title: string, data: any[], x: number, y: number, radius: number) => {
    doc.setFontSize(12);
    doc.setTextColor(44, 51, 123);
    doc.text(title, x, y - radius - 10, { align: 'center' });

    if (data.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Aucune donnée", x, y, { align: 'center' });
      return;
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2; // Start at top

    data.forEach(d => {
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      // Draw slice
      doc.setFillColor(d.color);
      doc.setDrawColor(d.color);
      const steps = Math.max(3, Math.ceil((endAngle - startAngle) * 15)); 
      let prevX = x + radius * Math.cos(startAngle);
      let prevY = y + radius * Math.sin(startAngle);
      
      for (let i = 1; i <= steps; i++) {
        const angle = startAngle + (i / steps) * (endAngle - startAngle);
        const nextX = x + radius * Math.cos(angle);
        const nextY = y + radius * Math.sin(angle);
        doc.triangle(x, y, prevX, prevY, nextX, nextY, 'DF');
        prevX = nextX;
        prevY = nextY;
      }
      
      // Draw percentage label if slice is big enough (> 5%)
      if (d.value / total > 0.05) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.65;
        const labelX = x + labelRadius * Math.cos(midAngle);
        const labelY = y + labelRadius * Math.sin(midAngle);
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        const percentText = Math.round((d.value / total) * 100) + '%';
        doc.text(percentText, labelX, labelY, { align: 'center', baseline: 'middle' });
      }
      
      startAngle = endAngle;
    });

    // Draw Legend
    let legendY = y + radius + 15;
    data.forEach(d => {
      doc.setFillColor(d.color);
      doc.setDrawColor(d.color);
      doc.rect(x - 20, legendY - 3, 4, 4, 'DF');
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`${d.name} (${d.value})`, x - 13, legendY);
      legendY += 6;
    });
  };

  const chartY = 95;
  const chartRadius = 25;
  
  drawPieChartWithLegend('Répartition par Statut', statusData, 58.5, chartY, chartRadius);
  drawPieChartWithLegend('Répartition par Canal', channelData, 147.5, chartY, chartRadius);
  drawPieChartWithLegend('Répartition par Source', sourceData, 236.5, chartY, chartRadius);

  let yPos = 170;
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
