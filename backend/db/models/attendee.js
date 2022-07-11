'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendee.belongsTo(
        models.User
      );
      Attendee.belongsTo(
        models.Event
      );
    }
  }
  Attendee.init({
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        checkStatusInput(value) {
          if ((value !== "member") || (value !== "pending") || (value !== "waitlist")) {
            throw new Error("Status must be 'member', 'waitlist', or 'pending'")
          }
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Events",
        key: "id"
      }
    }
  }, {
    sequelize,
    modelName: 'Attendee',
  });
  return Attendee;
};
