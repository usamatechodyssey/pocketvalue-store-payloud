
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { IOrder } from "@/models/Order";

interface InvoiceFooterProps {
  order: IOrder; // ✅ Order data receive karein
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceFooter = ({ order, styles }: InvoiceFooterProps) => {
  return (
    // Pehle ye <Text> tha, ab hum isay <View> bana rahe hain taake 2 lines aa sakein
    <View style={styles.footer}>
      <Text>
        Thank you for your purchase! For any support, please contact support@pocketvalue.pk.
      </Text>
      
      {/* ✅ FRAUD PREVENTION NOTE */}
      <Text style={styles.verificationNote}>
        Note: This document is computer generated. Validity of this order is subject to 
        verification with PocketValue&apos;s official database record for Order ID: {order.orderId}.
      </Text>
    </View>
  );
};