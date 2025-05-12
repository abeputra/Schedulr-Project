import { Sequelize } from "sequelize";
import db from "../config/database.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const Event = db.define(
  "events",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invited_members: {
      type: DataTypes.JSON, // Menyimpan array email sebagai JSON
      allowNull: false,
      defaultValue: [],
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    creator_email: {
      type: DataTypes.STRING, // Pastikan jenis kolom sesuai dengan email
      allowNull: false, // Sesuaikan apakah boleh null atau tidak
    },
  },
  {
    freezeTableName: true,
  }
);

// Relasi: Event dimiliki oleh satu User
Event.belongsTo(User, { foreignKey: "userId" });

export default Event;
