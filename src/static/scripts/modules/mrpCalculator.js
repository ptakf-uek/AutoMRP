export class MrpCalculator {
    mpsCalculator;

    constructor(mpsCalculator) {
        this.mpsCalculator = mpsCalculator;
    }

    calculateMrp(lowerBom, higherBom = { bomLevel: 0 }) {
        let onHand = lowerBom.onHand;
        let leadTime = lowerBom.leadTime;
        let lotSize = lowerBom.lotSize;

        let grossRequirements = []; // Całkowite zapotrzebowanie
        let scheduledReceipts = lowerBom.scheduledReceipts; // Planowane przyjęcia
        let projectedOnHand = []; // Przewidywane na stanie
        let netRequirements = []; // Zapotrzebowanie netto
        let plannedOrderReleases = []; // Planowane zamówienia
        let plannedOrderReceipts = []; // Planowane przyjęcie zamówień
        let ordersNeeded =0;

        if (higherBom.bomLevel == 0) {
            grossRequirements = this.mpsCalculator.productionList;
            for (let i = 0; i < this.mpsCalculator.leadTime; i++) {
                grossRequirements = grossRequirements.slice(1);
                grossRequirements.push(0);
                if (grossRequirements[0] !== 0) {
                    alert(
                        "Maximum possible lead time is " +
                            this.mpsCalculator.leadTime
                    );
                    break;
                }
            }
        } else {
            grossRequirements = higherBom.plannedOrderReleases;
        }

        for (let i = 0; i < this.mpsCalculator.weekAmount; i++) {
            // Obliczenie stanu zapasów (onHand)
            onHand -= grossRequirements[i];

            // Aktualizuj onHand
            onHand += scheduledReceipts[i];

            // Obliczenie ilości potrzebnych zamówień
            if (grossRequirements[i] > 0) {
                ordersNeeded += Math.ceil(grossRequirements[i]  / lotSize);
            }
            
            // Dodanie wartości netDemand do tablicy netRequirements
            if (onHand < 0) {
                netRequirements.push(Math.abs(onHand));
            } else {
                netRequirements.push(0);
            }

            // Dodanie lotSize do plannedOrderReleases na odpowiedniej pozycji
            if (netRequirements[i] > 0 && ordersNeeded > 0) {
                plannedOrderReleases.push(lotSize);
                ordersNeeded --;
            } else {
                plannedOrderReleases.push(0);
            }

            // Przesunięcie wartości plannedOrderReleases o leadTime w lewo
            for (let j = 0; j < leadTime; j++) {
                if (i - j >= 0 && plannedOrderReleases[i - j - 1] === 0) {
                    plannedOrderReleases[i - j - 1] =
                        plannedOrderReleases[i - j];
                    plannedOrderReleases[i - j] = 0;
                } else {
                    break;
                }
            }

            // Przesunięcie wartości plannedOrderReceipts o leadTime w prawo względem plannedOrderReleases
            plannedOrderReceipts[i] = 0; // Zerowanie wartości plannedOrderReceipts
            if (i >= leadTime) {
                plannedOrderReceipts[i] = plannedOrderReleases[i - leadTime];
            }

            onHand += plannedOrderReceipts[i];

            projectedOnHand.push(onHand);
        }

        lowerBom.plannedOrderReleases = plannedOrderReleases;

        return {
            grossRequirements: grossRequirements,
            scheduledReceipts: scheduledReceipts,
            projectedOnHand: projectedOnHand,
            netRequirements: netRequirements,
            plannedOrderReleases: plannedOrderReleases,
            plannedOrderReceipts: plannedOrderReceipts,
        };
    }
}