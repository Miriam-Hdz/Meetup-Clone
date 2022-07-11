'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(
        models.Group,
        { foreignKey: 'groupId'}
      );
      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId'}
      );
      Event.hasMany(
        models.Image,
        { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true}
      );
      Event.hasMany(
        models.Attendee,
        {foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true}
      );
    }
  }
  Event.init({
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        checkLength(value) {
          if (value.length < 5) {
            throw new Error("Name must be at least 5 characters")
          }
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        checkLength(value) {
          if (value.length < 1) {
            throw new Error("Must include a description")
          }
        }
      }
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        onlineOrInperson(value) {
          if ((value !== "Online") && (value !== "In person")) {
            throw new Error("Type must be 'Online' or ' In person'")
          }
        }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        checkDate(value) {
          const today = new Date();
          if (value < today) {
            throw new Error("Start date must be in the future")
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    numAttending: DataTypes.INTEGER,
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      },
      onDelete: 'cascade'
    },
    venueId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Venues',
        key: 'id'
      },
      onDelete: 'cascade',
    }
  }, {
    sequelize,
    validate: {
      checkDate() {
        if (this.startDate > this.endDate) {
          throw new Error("End date is less than start date")
        }
      }
    },
    modelName: 'Event',
  });
  return Event;
};
