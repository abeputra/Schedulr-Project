import { DataTypes } from "sequelize";
import db from "../config/database.js";

const SubEvent = db.define(
  "sub_events",
  {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    additional_description: {
      type: DataTypes.TEXT,
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    task_or_agenda: {
      type: DataTypes.ENUM("task", "agenda"),
      defaultValue: "task",
    },
    assignedtasks: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    assignedmembers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    freezeTableName: true,
    tableName: "sub_events",
  }
);

export default SubEvent;
