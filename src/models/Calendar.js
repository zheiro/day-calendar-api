export default {
	name: 'Calendar',
	register: (db, DataTypes) => db.define(
		'Calendar',
		{
			calendarId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
			},
			userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            start: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true
            }
		}
	)
};