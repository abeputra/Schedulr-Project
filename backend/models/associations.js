// models/associations.js
import Event from './EventModel.js';
import SubEvent from './SubEventModel.js';
import User from './UserModel.js';

Event.belongsTo(User, { foreignKey: "userId" });

Event.hasMany(SubEvent, {
  foreignKey: 'eventId',
  as: 'SubEvent'
});

SubEvent.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'Event'
});
