/* eslint-disable no-console */
import '@babel/polyfill';
import chalk from 'chalk';

import { db, models } from '../models';
import { CryptoUtil } from '../utils';


export default async function rebuildDatabase(prompt, { prePopulateInitial }) {

	try {
		const { Permission, AdminUser, AdminRole, Role, User, RuralBank, Client } = models;

		console.log(chalk.cyan('[1/3]'), ' Dropping existing tables...');
		await db.query('SET FOREIGN_KEY_CHECKS=0;');
		await db.drop();

		console.log(chalk.cyan('[2/3]'), ' Creating tables...');
		await db.sync();
		await db.query('SET FOREIGN_KEY_CHECKS=1;');

		console.log(chalk.cyan('[3/3]'), ' Creating initial data...');

		if (prePopulateInitial) {
			//create rural bank 1
			const ruralBank = await RuralBank.create({
				id: 'RB00000000',
				name: 'Cantilan Bank, Inc.',
				address: 'Cantilan, Surigao',
				mobileNumber: '+639171234567',
				landlineNumber: '+6321234567',
				email: 'email@cantilan.com',
				accountNumber: '123456789',
				tin: '111-222-333-444',
				rmFirstName: 'Re',
				rmMiddleName: 'La',
				rmLastName: 'Tionship',
				rmEmail: 'relationship@mail.com',
				rmMobileNumber: '+639171234567',
				rmPosition: 'Relationship Manager',
				status: 'APPROVED'
			});

			await ruralBank.update({
				participantId: 'deadbeef'
			});

			//create rural bank 2
			const ruralBank2 = await RuralBank.create({
				id: 'RB00000001',
				name: 'CitySavings Bank, Inc.',
				address: 'Ortigas, Pasig City',
				mobileNumber: '+639177654321',
				landlineNumber: '+6327654321',
				email: 'city@savings.com',
				accountNumber: '987654321',
				tin: '444-333-222-111',
				rmFirstName: 'Ma',
				rmMiddleName: 'Na',
				rmLastName: 'Ger',
				rmEmail: 'relation@manager.com',
				rmMobileNumber: '+639177654321',
				rmPosition: 'Relationship Manager',
				status: 'APPROVED'
			});

			await ruralBank2.update({
				participantId: 'foobar12'
			});

			// Create permissions
			const permissions = {};
			await Promise.all([
				{ id: 'ADMIN_DASHBOARD', label: 'Dashboard' },
				{ id: 'ADMIN_MANAGE_USERS', label: 'Manage Users' },
				{ id: 'ADMIN_AUDIT_LOGS', label: 'Audit Logs' },
				{ id: 'ADMIN_ENROLLMENTS', label: 'Enrollments' },
				{ id: 'LOCATE_RURAL_BANKS', label: 'Rural Bank Locator' },
				{ id: 'ADMIN_ADD_RURAL_BANK', label: 'Create Rural Bank' },
				{ id: 'APPROVE_USERS', label: 'Approve Users' },
				{ id: 'MANAGE_USERS', label: 'Manage Users' },
				{ id: 'MANAGE_CLIENTS', label: 'Manage Clients' },
				{ id: 'APPROVE_CLIENTS', label: 'Approve Clients' },
				{ id: 'TRANSFERS', label: 'Transfers' },
				{ id: 'DOMESTIC_REMITTANCES', label: 'Domestic Remittances' },
				{ id: 'TREASURY_VIEW', label: 'Treasury' }
			].map(async perm => {
				permissions[perm.id] = await Permission.create(perm);
			}));

			// Create root administrator role
			const rootAdminRole = await AdminRole.create({
				name: 'Root Administrator'
			});
			await rootAdminRole.addPermission(permissions.ADMIN_DASHBOARD, { through: { order: 1 } });
			await rootAdminRole.addPermission(permissions.ADMIN_MANAGE_USERS, { through: { order: 2 } });
			await rootAdminRole.addPermission(permissions.ADMIN_AUDIT_LOGS, { through: { order: 3 } });

			// Create implementation staff role
			const adminStaffRole = await AdminRole.create({
				name: 'Implementation Staff'
			});
			await adminStaffRole.addPermission(permissions.ADMIN_ADD_RURAL_BANK, { through: { order: 1 } });
			await adminStaffRole.addPermission(permissions.ADMIN_ENROLLMENTS, { through: { order: 2 } });
			await adminStaffRole.addPermission(permissions.LOCATE_RURAL_BANKS, { through: { order: 3 } });

			// Create implementation officer role
			const adminOfficerRole = await AdminRole.create({
				name: 'Implementation Officer'
			});
			await adminOfficerRole.addPermission(permissions.ADMIN_ENROLLMENTS, { through: { order: 1 } });
			await adminOfficerRole.addPermission(permissions.ADMIN_AUDIT_LOGS, { through: { order: 2 } });

			// Create authorized rep role
			const rbRepRole = await Role.create({
				name: 'Authorized Representative'
			});
			await rbRepRole.addPermission(permissions.APPROVE_USERS, { through: { order: 1 } });
			await rbRepRole.addPermission(permissions.MANAGE_USERS, { through: { order: 2 } });

			// Create sys ad role
			const rbSysAdRole = await Role.create({
				name: 'System Administrator'
			});
			await rbSysAdRole.addPermission(permissions.MANAGE_USERS, { through: { order: 1 } });

			// Create teller role
			const rbTellerRole = await Role.create({
				name: 'Teller'
			});
			await rbTellerRole.addPermission(permissions.MANAGE_CLIENTS, { through: { order: 1 } });
			await rbTellerRole.addPermission(permissions.LOCATE_RURAL_BANKS, { through: { order: 2 } });
			//await rbTellerRole.addPermission(permissions.TRANSFERS, { through: { order: 3 } });
			await rbTellerRole.addPermission(permissions.DOMESTIC_REMITTANCES, { through: { order: 4 } });

			// Create branch officer role
			const rbOfficerRole = await Role.create({
				name: 'Branch Officer'
			});
			await rbOfficerRole.addPermission(permissions.APPROVE_CLIENTS, { through: { order: 1 } });
			//await rbOfficerRole.addPermission(permissions.TRANSFERS, { through: { order: 2 } });
			await rbOfficerRole.addPermission(permissions.DOMESTIC_REMITTANCES, { through: { order: 3 } });

			// Create treasurer role (pending screens)
			const rbTreasurerRole = await Role.create({
				name: 'Treasurer'
			});
			await rbTreasurerRole.addPermission(permissions.TREASURY_VIEW, { through: { order: 1 } });

			// Create root administrator
			const { hash, salt } = CryptoUtil.hashPassword('password');
			const rootAdmin = await AdminUser.create({
				firstName: 'Henry',
				middleName: 'R',
				lastName: 'Aguda',
				position: 'Administrator',
				email: 'root@birbapp.unionbankph.com',
				mobileNumber: '+639195936155',
				password: hash,
				salt: salt,
				enabled: true,
			});
			await rootAdmin.addRole(rootAdminRole);

			// Create admin staff
			const adminStaff = await AdminUser.create({
				firstName: 'Lorena',
				middleName: 'A',
				lastName: 'Mayuga',
				position: 'Implementation Staff',
				email: 'staff@birbapp.unionbankph.com',
				mobileNumber: '+639195936155',
				password: hash,
				salt: salt,
				enabled: true,
			});
			await adminStaff.addRole(adminStaffRole);

			// Create admin officer
			const adminOfficer = await AdminUser.create({
				firstName: 'Bryan',
				middleName: 'A',
				lastName: 'Makasiar',
				position: 'Implementation Officer',
				email: 'officer@birbapp.unionbankph.com',
				mobileNumber: '+639195936155',
				password: hash,
				salt: salt,
				enabled: true,
			});
			await adminOfficer.addRole(adminOfficerRole);

			// Create rb rep
			const rbRep = await User.create({
				firstName: 'Tanya',
				middleName: 'A',
				lastName: 'Hotchkiss',
				position: 'Authorized Representative',
				status: 'APPROVED',
				email: 'rep@ruralbank.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000000',
				initialUser: true
			});
			await rbRep.addRole(rbRepRole);

			// Create rb sys admin
			const rbSysAd = await User.create({
				firstName: 'John',
				middleName: 'A',
				lastName: 'Luga',
				position: 'System Administrator',
				status: 'APPROVED',
				email: 'sysad@ruralbank.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000000',
				initialUser: true
			});
			await rbSysAd.addRole(rbSysAdRole);

			// Create rb teller
			const rbTeller = await User.create({
				firstName: 'Chelle',
				middleName: 'A',
				lastName: 'Bailon',
				position: 'Teller',
				status: 'APPROVED',
				email: 'teller@ruralbank.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000000'
			});
			await rbTeller.addRole(rbTellerRole);

			// Create rb officer
			const rbOfficer = await User.create({
				firstName: 'Branch',
				middleName: 'A',
				lastName: 'Officer',
				position: 'Branch Officer',
				status: 'APPROVED',
				email: 'officer@ruralbank.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000000'
			});
			await rbOfficer.addRole(rbOfficerRole);

			const rbTreasurer = await User.create({
				firstName: 'Treasurer',
				middleName: 'A',
				lastName: 'Treasurer',
				position: 'Treasurer',
				status: 'APPROVED',
				email: 'treasurer@ruralbank.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000000',
				initialUser: true
			});
			await rbTreasurer.addRole(rbTreasurerRole);

			// Create rb rep 2
			const rbRep2 = await User.create({
				firstName: 'Rep',
				middleName: 'Re',
				lastName: 'Sentative',
				position: 'Authorized Representative',
				status: 'APPROVED',
				email: 'rep@ruralbank2.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000001',
				initialUser: true
			});
			await rbRep2.addRole(rbRepRole);

			// Create rb sys admin 2
			const rbSysAd2 = await User.create({
				firstName: 'Ad',
				middleName: 'Min',
				lastName: 'Istrator',
				position: 'System Administrator',
				status: 'APPROVED',
				email: 'sysad@ruralbank2.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000001',
				initialUser: true
			});
			await rbSysAd2.addRole(rbSysAdRole);

			// Create rb teller
			const rbTeller2 = await User.create({
				firstName: 'Te',
				middleName: 'L',
				lastName: 'Ler',
				position: 'Teller',
				status: 'APPROVED',
				email: 'teller@ruralbank2.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000001'
			});
			await rbTeller2.addRole(rbTellerRole);

			// Create rb officer 2
			const rbOfficer2 = await User.create({
				firstName: 'Of',
				middleName: 'F',
				lastName: 'Icer',
				position: 'Branch Officer',
				status: 'APPROVED',
				email: 'officer@ruralbank2.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000001'
			});
			await rbOfficer2.addRole(rbOfficerRole);

			const rbTreasurer2 = await User.create({
				firstName: 'Trea',
				middleName: 'Su',
				lastName: 'Rer',
				position: 'Treasurer',
				status: 'APPROVED',
				email: 'treasurer@ruralbank2.ph',
				mobileNumber: '+639195936155',
				enabled: true,
				password: hash,
				salt: salt,
				ruralBankId: 'RB00000001',
				initialUser: true
			});
			await rbTreasurer2.addRole(rbTreasurerRole);

			await Client.create({
				firstName: 'Paul',
				middleName: 'Anthony',
				lastName: 'Lorenzo',
				address: 'Quezon City',
				birthDate: new Date(),
				birthPlace: 'Manila',
				gender: 'Male',
				civilStatus: 'Single',
				status: 'APPROVED',
				nationality: 'Philippines',
				mobileNumber: '+639195936155',
				landlineNumber: '+6325647382',
				email: 'paul@lorenzo.com',
				occupation: 'Employee',
				companyName: 'Pointwest',
				fundSource: 'Salary',
				idType: 'Driver License',
				idNumber: '1234567890',
				idExpiry: new Date(),
				govIdNumber: '1234567890',
				authorRuralBankId: 'RB00000000',
			});

			await Client.create({
				firstName: 'Keihertz',
				middleName: 'Azarcon',
				lastName: 'Besino',
				address: 'Makati City',
				birthDate: new Date(),
				birthPlace: 'Manila',
				gender: 'Male',
				civilStatus: 'Single',
				status: 'APPROVED',
				nationality: 'Philippines',
				mobileNumber: '+639195936155',
				landlineNumber: '+6325647382',
				email: 'keihertz@besino.com',
				occupation: 'Employee',
				companyName: 'Pointwest',
				fundSource: 'Salary',
				idType: 'Driver License',
				idNumber: '1234567890',
				idExpiry: new Date(),
				govIdNumber: '1234567890',
				authorRuralBankId: 'RB00000000'
			});

			await Client.create({
				firstName: 'Jose',
				middleName: 'Mari',
				lastName: 'Flores',
				address: 'Quezon City',
				birthDate: new Date(),
				birthPlace: 'Manila',
				gender: 'Male',
				civilStatus: 'Single',
				status: 'APPROVED',
				nationality: 'Philippines',
				mobileNumber: '+639195936155',
				landlineNumber: '+6325647382',
				email: 'jm@flores.com',
				occupation: 'Employee',
				companyName: 'Pointwest',
				fundSource: 'Salary',
				idType: 'Driver License',
				idNumber: '1234567890',
				idExpiry: new Date(),
				govIdNumber: '1234567890',
				authorRuralBankId: 'RB00000001'
			});

			await Client.create({
				firstName: 'Kerwin',
				middleName: 'Patrick',
				lastName: 'Mercadal',
				address: 'Makati City',
				birthDate: new Date(),
				birthPlace: 'Manila',
				gender: 'Male',
				status: 'APPROVED',
				civilStatus: 'Single',
				nationality: 'Philippines',
				mobileNumber: '+639195936155',
				landlineNumber: '+6325647382',
				email: 'kerwin@mercadal.com',
				occupation: 'Employee',
				companyName: 'Pointwest',
				fundSource: 'Salary',
				idType: 'Driver License',
				idNumber: '1234567890',
				idExpiry: new Date(),
				govIdNumber: '1234567890',
				authorRuralBankId: 'RB00000001'
			});
		} else {
			console.log(chalk.cyan('[i]'), 'You have opted not to pre-populate the tables.');
		}

		console.log(chalk.green('[√]'), 'Database has been rebuilt.');

	} catch (err) {
		console.log(chalk.red('[!]'), 'Unable to rebuild database:', err.message);
	}
}