
// /src/app/account/orders/[orderId]/_components/InvoiceHeader.tsx

import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { IOrder } from "@/models/Order";

interface InvoiceHeaderProps {
  order: IOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceHeader = ({ order, styles }: InvoiceHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.companyDetails}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          style={styles.logo}
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/Logo1.png`}
        />
        <Text style={styles.companyName}>PocketValue</Text>
        
        {/* ✅ UPDATED: "House No." hata kar "Plot No." kar diya (More Professional) */}
        <Text style={styles.companyAddress}>
          Plot No. L-73, Street No. 12, Sector 32/A,
        </Text>
        <Text style={styles.companyAddress}>
          Labour Colony, Landhi, Karachi, Pakistan
        </Text>

        <Text style={styles.companyAddress}>+92 303 0234064</Text>
        <Text style={styles.companyAddress}>support@pocketvalue.pk</Text>
      </View>

      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceTitle}>ORDER SUMMARY</Text>
        <Text style={styles.invoiceDetail}>Order ID: {order.orderId}</Text>
        <Text style={styles.invoiceDetail}>
          Date Issued: {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};