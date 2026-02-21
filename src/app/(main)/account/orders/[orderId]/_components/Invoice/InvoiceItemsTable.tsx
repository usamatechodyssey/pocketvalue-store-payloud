// /src/app/account/orders/[orderId]/_components/InvoiceItemsTable.tsx
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { IOrder } from "@/models/Order";
import { CleanCartItem } from "@/sanity/types/product_types";

interface InvoiceItemsTableProps {
  order: IOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceItemsTable = ({
  order,
  styles,
}: InvoiceItemsTableProps) => {
  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={[styles.tableHeaderCol, { width: "55%" }]}>
          <Text>Item</Text>
        </View>
        <View
          style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}
        >
          <Text>Qty</Text>
        </View>
        <View
          style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}
        >
          <Text>Price</Text>
        </View>
        <View
          style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}
        >
          <Text>Total</Text>
        </View>
      </View>

      {/* Table Rows */}
      {order.products.map((item: CleanCartItem, index) => (
        <View
          style={styles.tableRow}
          key={item.cartItemId || index}
          wrap={false}
        >
          <View style={[styles.tableCol, { width: "55%" }]}>
            <Text style={styles.tableCell}>{item.name}</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>{item.quantity}</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>
              Rs. {item.price.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Rs. {(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
