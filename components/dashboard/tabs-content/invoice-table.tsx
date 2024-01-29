"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { v4 as uuidv4 } from "uuid";

type ProductDetail = {
  size: string;
  squareFt: string;
  amount: string;
};

type ProductDetails = {
  details: ProductDetail[];
};

// Define a map for product details
const productDetailsMap: Record<string, ProductDetails> = {
  team: {
    details: [
      { size: "small", squareFt: "100", amount: "10000" },
      { size: "medium", squareFt: "200", amount: "20000" },
      { size: "large", squareFt: "300", amount: "30000" },
    ],
  },
  billing: {
    details: [
      { size: "small", squareFt: "150", amount: "15000" },
      { size: "medium", squareFt: "250", amount: "25000" },
    ],
  },
  // Add more products as needed
};

// Define the Product type
export type Product = {
  id: string;
  product: string;
  size: string;
  squareft: string;
  quantity: number;
  disc: number;
  amount: number;
};

export function InvoiceTable() {
  const createNewRow = (): Product => {
    return {
      id: uuidv4(),
      product: "",
      size: "",
      squareft: "",
      quantity: 1,
      disc: 0,
      amount: 0,
    };
  };

  const [data, setData] = useState<Product[]>([createNewRow()]);

  const handleValueChange = (
    productId: string,
    newValue: string | number,
    property: keyof Product
  ) => {
    setData((currentData) => {
      let newData = currentData.map((item) => {
        if (item.id === productId) {
          let updatedItem = { ...item, [property]: newValue };

          // Update squareft and amount when size changes
          if (property === "size") {
            const productDetails = productDetailsMap[item.product]?.details;
            const detail = productDetails?.find(
              (detail) => detail.size === newValue
            );
            if (detail) {
              updatedItem.squareft = detail.squareFt;
              updatedItem.amount = Number(detail.amount) * updatedItem.quantity;
            }
          }

          // Recalculate amount when quantity changes
          if (property === "quantity") {
            const productDetails = productDetailsMap[item.product]?.details;
            const detail = productDetails?.find(
              (detail) => detail.size === item.size
            );
            if (detail) {
              updatedItem.amount = Number(detail.amount) * Number(newValue);
            }
          }

          return updatedItem;
        }
        return item;
      });

      // Automatically add a new row if the last row's product is updated
      if (
        property === "product" &&
        productId === newData[newData.length - 1].id &&
        newValue
      ) {
        newData = [...newData, createNewRow()];
      }

      return newData;
    });
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.product}
          onValueChange={(newProduct) =>
            handleValueChange(row.original.id, newProduct, "product")
          }
        >
          <SelectTrigger id={`product-select-${row.id}`}>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(productDetailsMap).map((product) => (
              <SelectItem key={product} value={product}>
                {product.charAt(0).toUpperCase() + product.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        const product = row.original.product;
        const sizes = product
          ? productDetailsMap[product]?.details.map((detail) => detail.size) ||
            []
          : [];
        return (
          <Select
            defaultValue={row.original.size}
            onValueChange={(newSize) =>
              handleValueChange(row.original.id, newSize, "size")
            }
          >
            <SelectTrigger id={`size-select-${row.id}`}>
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "squareft",
      header: "Square Ft",
      cell: ({ row }) => {
        const product = row.original.product;
        const squareFts = product
          ? productDetailsMap[product]?.details.map(
              (detail) => detail.squareFt
            ) || []
          : [];
        return (
          <Select
            defaultValue={row.original.squareft}
            onValueChange={(newSquareFt) =>
              handleValueChange(row.original.id, newSquareFt, "squareft")
            }
          >
            <SelectTrigger id={`squareft-select-${row.id}`}>
              <SelectValue placeholder="Select square ft" />
            </SelectTrigger>
            <SelectContent>
              {squareFts.map((squareFt) => (
                <SelectItem key={squareFt} value={squareFt}>
                  {squareFt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <Input
          className="max-w-[5rem]"
          type="number"
          value={row.original.quantity}
          onChange={(e) =>
            handleValueChange(row.original.id, e.target.value, "quantity")
          }
        />
      ),
    },
    {
      accessorKey: "disc",
      header: "Disc",
      cell: ({ row }) => (
        <Input
          className="w-12 md:w-auto md:max-w-[5rem]"
          type="number"
          value={row.original.disc}
          onChange={(e) =>
            handleValueChange(row.original.id, e.target.value, "disc")
          }
        />
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const product = row.original.product;
        const quantity = row.original.quantity;
        const productDetails = productDetailsMap[product]?.details;
        const detail = productDetails?.find(
          (detail) => detail.size === row.original.size
        );
        const amount = detail ? Number(detail.amount) * quantity : 0; // Calculate amount based on quantity
        return (
          <Input
            className="max-w-[10rem]"
            type="number"
            value={amount.toString()}
            readOnly
          />
        );
      },
    },
  ];

  // Calculate total discount and amount
  const calculateTotals = () => {
    let totalDisc = 0;
    let totalAmount = 0;

    data.forEach((item) => {
      totalDisc += Number(item.disc);
      totalAmount += item.amount;
    });

    return { totalDisc, totalAmount };
  };

  const { totalDisc, totalAmount } = calculateTotals();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    console.log("Updated Data: ", data);
  }, [data]);

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-4 justify-center lg:gap-16 mt-6 lg:justify-end lg:mr-16">
        <div>
          <Label htmlFor="subject">Total Disc</Label>
          <Input
            id="total-disc"
            className="max-w-[5rem]"
            type="number"
            value={totalDisc}
            readOnly
            placeholder="Total Discount Amount"
          />
        </div>
        <div>
          <Label htmlFor="subject">Total Amount</Label>
          <Input
            id="total-amount"
            className="max-w-[10rem]"
            type="number"
            value={totalAmount}
            readOnly
            placeholder="Total Sale Amount"
          />
        </div>
      </div>
    </div>
  );
}
