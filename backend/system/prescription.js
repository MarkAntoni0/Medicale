const Medicine = require('./system/prescription');

class Prescription {
    constructor(physicianID, patientID) {
        const cd = new Date();
        this.prescriptionID = (() => {
            const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let id = '';
            for (let i = 0; i < 9; i++) {
                id += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return id;
        })();
        this.physicianID = physicianID;
        this.patientID = patientID;
        this.issuanceDate = cd.getDate() + "/" + (cd.getMonth() + 1) + "/" + cd.getFullYear();
        this.issuanceTime = cd.getHours() + ":" + cd.getMinutes() + ":" + cd.getSeconds();
        this.items = [];
        this.expirationDate = undefined;
        this.insuranceCompany = undefined;
    }

    addItem(item) {
        if (item instanceof Medicine) this.items.push(item);
        else console.log('INVALID ITEM');
    }

    removeItem(item) {
        if (!(item instanceof Medicine)) {
            console.log('INVALID ITEM');
            return;
        }

        if (this.items.includes(item)) {
            this.items.forEach(i => {
                if (this.items[i] === item) this.items.splice(i, 1);
            });
        }
    }

    editQuantity(item) {

    }

    calculateBill() {
        let total = 0;
        for (const i of this.items) {
            console.log(i);
        }
    }

    sendPrescription(insurance) {
        console.log('sending prescription.');
    }

} module.exports = Prescription;
