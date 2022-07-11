'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.hasMany(
        models.Event,
        { foreignKey: 'venueId'}
      );
      Venue.belongsTo(
        models.Group,
        { foreignKey: 'groupId'}
      );
    }
  }
  Venue.init({
    address: {
      type: DataTypes.VARCHAR(1, 50),
      allowNull: false,
      unique: true,
      validate: {
        beginsWithNum(value) {
          if (isNaN(value[0])) {
            throw new Error("Must be a valid address")
          }
        }
      }
    },
    city: {
      type: DataTypes.VARCHAR(1, 50),
      allowNull: false
    },
    state: {
      type: DataTypes.VARCHAR(2, 2),
      allowNull: false
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        checkDecimalPlaces(value) {
          const string = value.toString();
          const array = string.split('.');

          if (array[1].length !== 7) {
            throw new Error("Must be valid lat")
          }
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        checkDecimalPlaces(value) {
          const string = value.toString();
          const array = string.split('.');

          if (array[1].length !== 7) {
            throw new Error("Must be valid lng")
          }
        }
      }
      },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
