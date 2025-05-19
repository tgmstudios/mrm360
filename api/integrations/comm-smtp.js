const nodemailer = require('nodemailer');

class SMTPIntegration {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendVerificationEmail(email, verificationLink) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'Verify your MRM 360 account',
                html: `
                    <h1>Welcome to MRM 360!</h1>
                    <p>Please verify your account by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Account</a>
                    <p>This link will expire in 24 hours.</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }

    async sendTeamInvite(email, teamName, inviteLink) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: `Invitation to join ${teamName} on MRM 360`,
                html: `
                    <h1>Team Invitation</h1>
                    <p>You have been invited to join the team "${teamName}" on MRM 360.</p>
                    <a href="${inviteLink}">Accept Invitation</a>
                    <p>This invitation will expire in 7 days.</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Error sending team invite:', error);
            throw error;
        }
    }

    async sendEventReminder(email, eventData) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: `Reminder: ${eventData.name} is coming up`,
                html: `
                    <h1>Event Reminder</h1>
                    <p>The event "${eventData.name}" is scheduled for ${new Date(eventData.startTime).toLocaleString()}.</p>
                    <p>Location: ${eventData.location}</p>
                    <p>Description: ${eventData.description}</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Error sending event reminder:', error);
            throw error;
        }
    }

    async sendInventoryNotification(email, itemData, action) {
        try {
            const subject = action === 'checkout' ? 'Item Checkout Confirmation' : 'Item Check-in Confirmation';
            const message = action === 'checkout' 
                ? `You have checked out the following item:`
                : `You have checked in the following item:`;

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject,
                html: `
                    <h1>${subject}</h1>
                    <p>${message}</p>
                    <ul>
                        <li>Item: ${itemData.name}</li>
                        <li>Category: ${itemData.category}</li>
                        <li>Serial Number: ${itemData.serialNumber}</li>
                        <li>Time: ${new Date().toLocaleString()}</li>
                    </ul>
                `
            });
            return true;
        } catch (error) {
            console.error('Error sending inventory notification:', error);
            throw error;
        }
    }

    async sendVPNRequestNotification(email, requestData) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'VPN Access Request',
                html: `
                    <h1>VPN Access Request</h1>
                    <p>Your VPN access request has been ${requestData.status}.</p>
                    ${requestData.status === 'approved' ? `
                        <p>You can now access the VPN using the following credentials:</p>
                        <ul>
                            <li>Username: ${requestData.username}</li>
                            <li>Password: ${requestData.password}</li>
                        </ul>
                    ` : `
                        <p>Reason: ${requestData.reason || 'No reason provided'}</p>
                    `}
                `
            });
            return true;
        } catch (error) {
            console.error('Error sending VPN notification:', error);
            throw error;
        }
    }
}

module.exports = new SMTPIntegration();
