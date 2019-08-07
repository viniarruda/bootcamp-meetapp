module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('meetups', 'banner_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('meetups', 'banner_id');
  },
};
