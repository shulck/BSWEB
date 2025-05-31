import { Setlist } from '../types';

export class PDFExportService {
  static generateSetlistPDF(setlist: Setlist): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalDuration = setlist.songs.reduce((total, song) => {
      return total + (song.durationMinutes * 60) + song.durationSeconds;
    }, 0);

    const formatDuration = (totalSeconds: number): string => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatSongDuration = (minutes: number, seconds: number): string => {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${setlist.name} - Setlist</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header .info {
            color: #666;
            font-size: 14px;
          }
          .song-list {
            margin-bottom: 30px;
          }
          .song {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .song:last-child {
            border-bottom: none;
          }
          .song-number {
            font-weight: bold;
            margin-right: 15px;
            min-width: 30px;
          }
          .song-title {
            flex-grow: 1;
            font-size: 16px;
          }
          .song-details {
            text-align: right;
            font-size: 12px;
            color: #666;
            min-width: 120px;
          }
          .song-meta {
            margin-top: 5px;
            font-size: 11px;
            color: #888;
          }
          .summary {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
          }
          .chords {
            font-size: 12px;
            color: #0066cc;
            margin-top: 3px;
          }
          .notes {
            font-size: 11px;
            color: #666;
            font-style: italic;
            margin-top: 3px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${setlist.name}</h1>
          <div class="info">
            ${setlist.concertDate ? 
              `Concert Date: ${new Date(setlist.concertDate).toLocaleDateString()}` : 
              'No concert date set'
            }
            <br>
            ${setlist.songs.length} songs • Total Duration: ${formatDuration(totalDuration)}
          </div>
        </div>

        <div class="song-list">
          ${setlist.songs.map((song, index) => `
            <div class="song">
              <div class="song-number">${index + 1}.</div>
              <div style="flex-grow: 1;">
                <div class="song-title">${song.title}</div>
                ${song.chords ? `<div class="chords">Chords: ${song.chords}</div>` : ''}
                ${song.notes ? `<div class="notes">${song.notes}</div>` : ''}
              </div>
              <div class="song-details">
                <div>${formatSongDuration(song.durationMinutes, song.durationSeconds)}</div>
                <div class="song-meta">
                  ${song.bpm ? `${song.bpm} BPM` : ''}
                  ${song.key ? ` • ${song.key}` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="summary">
          <strong>Performance Summary</strong><br>
          Total Songs: ${setlist.songs.length} • 
          Total Duration: ${formatDuration(totalDuration)} • 
          Generated: ${new Date().toLocaleDateString()}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
