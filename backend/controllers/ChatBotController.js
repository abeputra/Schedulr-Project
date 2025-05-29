import { OpenAI } from 'openai';
import db from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const checkConflict = async (req, res) => {
  try {
    const mode = req.body.mode || "analisis";
    const userQuery = req.body.userQuery || req.body.message || "";

    // MODE: input_event
    if (mode === "input_event") {
      const userId = req.user?.id || 1;
      const creator_email = req.user?.email || "";

      const eventModel = {
        title: "",
        organizer: "",
        description: "",
        invited_members: [],
        userId,
        creator_email
      };

      const prompt = `
Kamu adalah asisten pembuatan event.
User Prompt: ${userQuery}
Berikan saran, validasi, atau instruksi pengisian data event berikut (format JSON):
${JSON.stringify(eventModel, null, 2)}
Jawab dalam Bahasa Indonesia.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      // Ambil JSON dari response OpenAI (jika ada)
      let suggestedModel = null;
      const match = response.choices[0].message.content.match(/```json([\s\S]*?)```|{[\s\S]*}/);
      if (match) {
        try {
          // Ambil bagian JSON saja
          const jsonStr = match[1] ? match[1] : match[0];
          suggestedModel = JSON.parse(jsonStr);
        } catch (e) {
          // Jika parsing gagal, biarkan null
          suggestedModel = null;
        }
      }

      return res.json({
        model: eventModel,
        response: response.choices[0].message.content,
        suggestedModel // FE bisa langsung render form dari sini jika ada
      });
    }

    // MODE: input_subevent
    if (mode === "input_subevent") {
      const subEventModel = {
        eventId: req.body.eventId || 1,
        title: "",
        description: "",
        additional_description: "",
        organizer: "",
        date: "",
        time: "",
        location: "",
        task_or_agenda: "task",
        assignedtasks: [],
        assignedmembers: []
      };

      // Prompt dinamis untuk input subevent
      const prompt = `
Kamu adalah asisten pembuatan subevent.
User Prompt: ${userQuery}
Berikan saran, validasi, atau instruksi pengisian data subevent berikut (format JSON):
${JSON.stringify(subEventModel, null, 2)}
Jawab dalam Bahasa Indonesia.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      return res.json({
        model: subEventModel,
        response: response.choices[0].message.content
      });
    }

    // MODE: analisis (default)
    let eventsData;
    try {
      const events = await db.models.Event.findAll({
        include: [{
          model: db.models.SubEvent,
          as: "SubEvents"
        }],
        limit: 10
      });
      eventsData = events;
    } catch (sequelizeError) {
      console.warn('Sequelize error, fallback to raw query:', sequelizeError);
      const [results] = await db.query(`
        SELECT 
            e.id, e.title as event_title, e.organizer as event_organizer, e.description as event_description, e.invited_members, e.userId, e.creator_email,
            s.id as subevent_id, s.title as subevent_title, s.description as subevent_description, s.additional_description, s.organizer as subevent_organizer, s.date, s.time, s.location, s.task_or_agenda, s.assignedtasks, s.assignedmembers
        FROM events e
        LEFT JOIN sub_events s ON e.id = s."eventId" 
        LIMIT 10
      `);
      eventsData = results;
    }

    // Format data agar sesuai model FE
    const formatData = (data) => {
      if (!data) return [];
      // Raw query
      if (Array.isArray(data) && data[0]?.event_title) {
        const grouped = {};
        data.forEach(row => {
          if (!grouped[row.id]) {
            grouped[row.id] = {
              id: row.id,
              title: row.event_title,
              organizer: row.event_organizer,
              description: row.event_description,
              invited_members: row.invited_members,
              userId: row.userId,
              creator_email: row.creator_email,
              subEvents: []
            };
          }
          if (row.subevent_id) {
            grouped[row.id].subEvents.push({
              id: row.subevent_id,
              eventId: row.id,
              title: row.subevent_title,
              description: row.subevent_description,
              additional_description: row.additional_description,
              organizer: row.subevent_organizer,
              date: row.date,
              time: row.time,
              location: row.location,
              task_or_agenda: row.task_or_agenda,
              assignedtasks: row.assignedtasks,
              assignedmembers: row.assignedmembers
            });
          }
        });
        return Object.values(grouped);
      }
      // Sequelize
      return data.map(event => ({
        id: event.id,
        title: event.title,
        organizer: event.organizer,
        description: event.description,
        invited_members: event.invited_members,
        userId: event.userId,
        creator_email: event.creator_email,
        subEvents: event.SubEvents?.map?.(sub => ({
          id: sub.id,
          eventId: sub.eventId,
          title: sub.title,
          description: sub.description,
          additional_description: sub.additional_description,
          organizer: sub.organizer,
          date: sub.date,
          time: sub.time,
          location: sub.location,
          task_or_agenda: sub.task_or_agenda,
          assignedtasks: sub.assignedtasks,
          assignedmembers: sub.assignedmembers
        })) || []
      }));
    };

    const formattedEvents = formatData(eventsData);

    if (formattedEvents.length === 0) {
      formattedEvents.push({
        id: 1,
        title: "[Contoh] Tech Conference",
        organizer: "Panitia",
        description: "Deskripsi event contoh",
        invited_members: ["contoh1@email.com"],
        userId: 1,
        creator_email: "creator@email.com",
        subEvents: [{
          id: 1,
          eventId: 1,
          title: "[Contoh] Workshop",
          description: "Deskripsi subevent contoh",
          additional_description: "Keterangan tambahan",
          organizer: "Panitia",
          date: "2025-05-15",
          time: "14:00",
          location: "Ruang A",
          task_or_agenda: "task",
          assignedtasks: [],
          assignedmembers: []
        }]
      });
    }

    const prompt = `User Query: ${userQuery}
Event Data: ${JSON.stringify(formattedEvents, null, 2)}

Analisis dalam Bahasa Indonesia:
1. Identifikasi konflik jadwal (hari/waktu/lokasi sama)
2. Beri rekomendasi jika ada konflik
3. Saran penjadwalan alternatif`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    res.json({
      response: response.choices[0].message.content,
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