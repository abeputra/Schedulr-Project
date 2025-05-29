import { OpenAI } from 'openai';
import db from '../config/database.js'; // Import langsung db
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const checkConflict = async (req, res) => {
  try {
    // 1. Ambil data dengan query RAW sebagai fallback
    let eventsData;
    
    try {
      // Coba cara Sequelize biasa dulu
      const events = await db.models.Event.findAll({
        include: [{ model: db.models.SubEvent }],
        limit: 10 // Batasi hasil untuk testing
      });
      eventsData = events;
    } catch (sequelizeError) {
      console.warn('Sequelize error, fallback to raw query:', sequelizeError);
      
      // Fallback ke raw query jika error
        // Ubah bagian raw query menjadi:
        const [results] = await db.query(`
        SELECT 
            e.id, e.title as event_title,
            s.title as subevent_title, s.date, s.time, s.location
        FROM events e
        LEFT JOIN sub_events s ON e.id = s."eventId"  -- Perhatikan "eventId" dengan huruf besar I
        LIMIT 10
        `);
      
      eventsData = results;
    }

    // 2. Format data dengan aman
    const formatData = (data) => {
      if (!data) return [];
      
      // Handle hasil raw query
      if (Array.isArray(data) && data[0]?.event_title) {
        const grouped = {};
        data.forEach(row => {
          if (!grouped[row.id]) {
            grouped[row.id] = {
              title: row.event_title,
              subEvents: []
            };
          }
          if (row.subevent_title) {
            grouped[row.id].subEvents.push({
              title: row.subevent_title,
              date: row.date,
              time: row.time,
              location: row.location
            });
          }
        });
        return Object.values(grouped);
      }
      
      // Handle hasil Sequelize
      return data.map(event => ({
        title: event.title,
        subEvents: event.SubEvents?.map?.(sub => ({
          title: sub.title,
          date: sub.date,
          time: sub.time,
          location: sub.location
        })) || []
      }));
    };

    const formattedEvents = formatData(eventsData);

    if (formattedEvents.length === 0) {
      // Kasus khusus untuk testing tanpa data
      formattedEvents.push({
        title: "[Contoh] Tech Conference",
        subEvents: [{
          title: "[Contoh] Workshop",
          date: "2025-05-15",
          time: "14:00",
          location: "Ruang A"
        }]
      });
    }
    console.log('Formatted Events:', JSON.stringify(formattedEvents, null, 2));
    // 3. Kirim ke OpenAI
    const prompt = `User Query: ${req.body.userQuery || "Cek konflik"}
    Event Data: ${JSON.stringify(formattedEvents, null, 2)}
        
    Analisis dalam Bahasa Indonesia:
    1. Identifikasi konflik jadwal (hari/waktu/lokasi sama)
    2. Beri rekomendasi jika ada konflik
    3. Saran penjadwalan alternatif`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3 // Kurangi kreativitas untuk hasil lebih akurat
    });

    // 4. Response ke client
    res.json({
      analysis: response.choices[0].message.content,
      debug: { 
        eventCount: formattedEvents.length,
        sampleEvent: formattedEvents[0] 
      }
    });

  } catch (error) {
    console.error('Global Error:', error);
    res.status(500).json({ 
      error: "System busy, please try again later",
      technicalDetails: error.message 
    });
  }
};
// import { OpenAI } from 'openai';
// import Event from '../models/EventModel.js';
// import SubEvent from '../models/SubEventModel.js';

// const openai = new OpenAI(process.env.OPENAI_API_KEY);

// export const checkConflict = async (req, res) => {
//   try {
//     // 1. Ambil semua data dari database
//     const events = await Event.findAll({
//       include: [{ model: SubEvent }]
//     });

//     // 2. Format data untuk dikirim ke AI
//     const dataForAI = {
//       userQuery: req.body.userQuery, // Pertanyaan user
//       events: events.map(event => ({
//         title: event.title,
//         subEvents: event.SubEvents.map(sub => ({
//           title: sub.title,
//           date: sub.date,
//           time: sub.time,
//           location: sub.location
//         }))
//       }))
//     };

//     // 3. Kirim ke AI
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{
//         role: "user",
//         content: `
//           User Question: ${dataForAI.userQuery}
//           Event Data: ${JSON.stringify(dataForAI.events)}
          
//           Berikan analisis singkat dalam 1 paragraf tentang:
//           - Konflik jadwal
//           - Rekomendasi waktu
//           - Saran penjadwalan
//         `
//       }]
//     });

//     // 4. Kirim balasan AI langsung ke client
//     res.json({
//       result: response.choices[0].message.content
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Terjadi kesalahan' });
//   }
// };

// import { Event, SubEvent } from '../models/index.js';
// import db from '../config/database.js'; // Sesuaikan path
// // Setelah semua model di-definisikan
// Object.values(db.models).forEach(model => {
//   if (model.associate) {
//     model.associate(db.models);
//   }
// });
// /**
//  * Deteksi konflik jadwal (murni BE)
//  * @param {Date} newDate - Format: YYYY-MM-DD
//  * @param {Time} newTime - Format: HH:MM
//  * @param {Number} duration - Dalam jam
//  */
// export const detectScheduleConflicts = async (req, res) => {
//   const { userId } = req.user; // Dari middleware verifyToken
//   const { newDate, newTime, duration = 2 } = req.body;

//   if (!newDate || !newTime) {
//     return res.status(400).json({
//       success: false,
//       message: 'newDate and newTime are required'
//     });
//   }

//   try {
//     // 1. Ambil semua sub-event user
//     const events = await Event.findAll({
//       where: { userId },
//       include: [{
//         model: SubEvent,
//         attributes: ['id', 'title', 'date', 'time', 'location', 'duration']
//       }],
//       attributes: ['id', 'title']
//     });

//     // 2. Format data
//     const allSubEvents = events.flatMap(event => 
//       event.SubEvents.map(subEvent => ({
//         eventId: event.id,
//         eventTitle: event.title,
//         subEventId: subEvent.id,
//         title: subEvent.title,
//         date: subEvent.date,
//         time: subEvent.time,
//         location: subEvent.location,
//         duration: subEvent.duration || 2 // Default 2 jam
//       }))
//     );

//     // 3. Cari konflik langsung
//     const directConflicts = allSubEvents.filter(subEvent => {
//       return subEvent.date === newDate && 
//              isTimeOverlap(subEvent.time, subEvent.duration, newTime, duration);
//     });

//     // 4. Cari konflik tidak langsung (lokasi sama dalam waktu berdekatan)
//     const proximityConflicts = allSubEvents.filter(subEvent => {
//       const isSameLocation = subEvent.location === req.body.location;
//       const isSameDate = subEvent.date === newDate;
//       const isCloseTime = isTimeWithinMargin(
//         subEvent.time, subEvent.duration, 
//         newTime, duration,
//         30 // Margin 30 menit
//       );
      
//       return isSameLocation && isSameDate && isCloseTime;
//     });

//     res.json({
//       success: true,
//       data: {
//         directConflicts: directConflicts.map(c => ({
//           id: c.subEventId,
//           title: c.title,
//           time: c.time,
//           location: c.location
//         })),
//         proximityConflicts: proximityConflicts.map(c => ({
//           id: c.subEventId,
//           title: c.title,
//           time: c.time,
//           location: c.location
//         })),
//         allSubEvents // Untuk debugging
//       }
//     });

//   } catch (error) {
//     console.error('Error checking schedule:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Helper: Cek overlap waktu
// function isTimeOverlap(existingTime, existingDuration, newTime, newDuration) {
//   const [existingHour, existingMin] = existingTime.split(':').map(Number);
//   const [newHour, newMin] = newTime.split(':').map(Number);
  
//   const existingStart = existingHour * 60 + existingMin;
//   const existingEnd = existingStart + (existingDuration * 60);
  
//   const newStart = newHour * 60 + newMin;
//   const newEnd = newStart + (newDuration * 60);
  
//   return newStart < existingEnd && newEnd > existingStart;
// }

// // Helper: Cek waktu dalam margin tertentu
// function isTimeWithinMargin(time1, dur1, time2, dur2, marginMinutes) {
//   const [h1, m1] = time1.split(':').map(Number);
//   const [h2, m2] = time2.split(':').map(Number);
  
//   const start1 = h1 * 60 + m1;
//   const end1 = start1 + (dur1 * 60);
  
//   const start2 = h2 * 60 + m2;
//   const end2 = start2 + (dur2 * 60);
  
//   return (start2 >= (start1 - marginMinutes) && start2 <= (end1 + marginMinutes)) ||
//          (end2 >= (start1 - marginMinutes) && end2 <= (end1 + marginMinutes));
// }