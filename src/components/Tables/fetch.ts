import * as logos from "@/assets/logos";
import { apiClient } from "@/lib/api-client";

export async function getTopProducts() {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/products/top');
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/product/product-01.png",
      name: "Apple Watch Series 7",
      category: "Electronics",
      price: 296,
      sold: 22,
      profit: 45,
    },
    {
      image: "/images/product/product-02.png",
      name: "Macbook Pro M1",
      category: "Electronics",
      price: 546,
      sold: 12,
      profit: 125,
    },
    {
      image: "/images/product/product-03.png",
      name: "Dell Inspiron 15",
      category: "Electronics",
      price: 443,
      sold: 64,
      profit: 247,
    },
    {
      image: "/images/product/product-04.png",
      name: "HP Probook 450",
      category: "Electronics",
      price: 499,
      sold: 72,
      profit: 103,
    },
  ];
}

export async function getInvoiceTableData() {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/invoices');
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1400));

  return [
    {
      name: "Free package",
      price: 0.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Paid",
    },
    {
      name: "Standard Package",
      price: 59.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Paid",
    },
    {
      name: "Business Package",
      price: 99.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Unpaid",
    },
    {
      name: "Standard Package",
      price: 59.0,
      date: "2023-01-13T18:00:00.000Z",
      status: "Pending",
    },
  ];
}

export async function getTopChannels() {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/channels/top');
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      name: "Google",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.google,
    },
    {
      name: "X.com",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.x,
    },
    {
      name: "Github",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.github,
    },
    {
      name: "Vimeo",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.vimeo,
    },
    {
      name: "Facebook",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.facebook,
    },
  ];
}

export async function getSettlements() {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/settlements');
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      name: "Google",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.google,
    },
    {
      name: "X.com",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.x,
    },
    {
      name: "Github",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.github,
    },
    {
      name: "Vimeo",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.vimeo,
    },
    {
      name: "Facebook",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.facebook,
    },
  ];
}