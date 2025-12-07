export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("poll_votes", {
      voteId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      pollId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      voterId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      choice: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
    await queryInterface.addIndex("poll_votes", ["pollId", "voterId"], {
      name: "idx_poll_votes_poll_voter"
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("poll_votes");
  }
};
