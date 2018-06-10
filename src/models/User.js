export default {
	name: 'User',
	register: (db, DataTypes) => db.define(
		'User',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING,
			},
			salt: {
				type: DataTypes.STRING,
			},
		}
	)
};