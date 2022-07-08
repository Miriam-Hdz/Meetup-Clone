'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );
    }
  }
  Image.init({
    imageableType: DataTypes.STRING,
    url: DataTypes.STRING,
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};
