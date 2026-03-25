import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function weekKey(date: Date) {
  // ISO week-based key: YYYY-Www
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function buildRecentMonthBuckets(months: number) {
  const map: Record<string, { sales: number; profit: number }> = {};
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map[monthKey(d)] = { sales: 0, profit: 0 };
  }
  return map;
}

function buildRecentWeekBuckets(weeks: number) {
  const map: Record<string, { sales: number; expenses: number; net: number }> = {};
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i * 7));
    map[weekKey(d)] = { sales: 0, expenses: 0, net: 0 };
  }
  return map;
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const [
      { count: productsCount },
      { count: categoriesCount },
      { count: salesCount },
      { count: clientsCount },
      { data: recentSales },
      { data: salesRaw },
      { data: expensesRaw },
      { data: productsRaw },
      { data: categoriesRaw }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('sales').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase
        .from('sales')
        .select('id, item_nome, cliente, valor_venda, valor_devido, lucro, data_venda, tipo_pagamento')
        .order('data_venda', { ascending: false })
        .limit(8),
      supabase
        .from('sales')
        .select('id, product_id, item_nome, valor_venda, valor_devido, lucro, data_venda'),
      supabase
        .from('expenses')
        .select('id, categoria, valor_total, data_gasto'),
      supabase
        .from('products')
        .select('id, nome, category_id, quantidade_estoque, estoque_minimo'),
      supabase
        .from('categories')
        .select('id, nome, cor')
    ]);

    const sales = Array.isArray(salesRaw) ? salesRaw : [];
    const expenses = Array.isArray(expensesRaw) ? expensesRaw : [];
    const products = Array.isArray(productsRaw) ? productsRaw : [];
    const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

    const categoryById = new Map<number, { nome: string; cor?: string }>();
    const categoryByName = new Map<string, { id: number, nome: string; cor?: string }>();
    categories.forEach((c: any) => {
      categoryById.set(Number(c.id), { nome: c.nome, cor: c.cor });
      categoryByName.set(String(c.nome).trim().toLowerCase(), { id: c.id, nome: c.nome, cor: c.cor });
    });

    const productById = new Map<number, any>();
    products.forEach((p: any) => productById.set(Number(p.id), p));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalSalesValue = 0;
    let totalProfit = 0;
    let totalReceivable = 0;
    let monthSalesValue = 0;
    let monthProfit = 0;

    const monthlyBuckets = buildRecentMonthBuckets(6);
    const weeklyBuckets = buildRecentWeekBuckets(8);
    const salesByCategoryMap: Record<string, { name: string; value: number; color: string }> = {};

    for (const sale of sales as any[]) {
      const value = Number(sale.valor_venda) || 0;
      const profit = Number(sale.lucro) || 0;
      const receivable = Math.max(0, Number(sale.valor_devido) || 0);
      const d = new Date(sale.data_venda);

      totalSalesValue += value;
      totalProfit += profit;
      totalReceivable += receivable;

      if (!Number.isNaN(d.getTime())) {
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthSalesValue += value;
          monthProfit += profit;
        }

        const mk = monthKey(d);
        if (monthlyBuckets[mk]) {
          monthlyBuckets[mk].sales += value;
          monthlyBuckets[mk].profit += profit;
        }

        const wk = weekKey(d);
        if (weeklyBuckets[wk]) {
          weeklyBuckets[wk].sales += value;
        }
      }

      const product = productById.get(Number(sale.product_id));
      let categoryId = product?.category_id ? Number(product.category_id) : 0;
      let cat = categoryById.get(categoryId);

      if (!categoryId) {
        // Try extracting from raw item_nome like we do in Vendas frontend
        const cMatch = String(sale.item_nome || '').match(/\s*\[(.*?)\]$/);
        if (cMatch) {
          const parsedCatName = cMatch[1];
          const foundCat = categoryByName.get(parsedCatName.trim().toLowerCase());
          if (foundCat) {
            categoryId = foundCat.id;
            cat = foundCat;
          } else {
            // Group under the extracted string anyway, just assigned a dynamic key
            categoryId = -1;
            cat = { nome: parsedCatName, cor: '#00bcff' };
          }
        }
      }

      const key = cat ? String(cat.nome) : '0';
      if (!salesByCategoryMap[key]) {
        salesByCategoryMap[key] = {
          name: cat?.nome || 'Sem categoria',
          value: 0,
          color: cat?.cor || '#64748b'
        };
      }
      salesByCategoryMap[key].value += value;
    }

    let monthExpensesValue = 0;
    const expenseByCategoryMap: Record<string, number> = {};
    for (const expense of expenses as any[]) {
      const value = Number(expense.valor_total) || 0;
      const d = new Date(expense.data_gasto);

      if (!Number.isNaN(d.getTime())) {
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthExpensesValue += value;
          const cat = String(expense.categoria || 'Sem categoria');
          expenseByCategoryMap[cat] = (expenseByCategoryMap[cat] || 0) + value;
        }

        const wk = weekKey(d);
        if (weeklyBuckets[wk]) {
          weeklyBuckets[wk].expenses += value;
        }
      }
    }

    Object.keys(weeklyBuckets).forEach((wk) => {
      weeklyBuckets[wk].net = weeklyBuckets[wk].sales - weeklyBuckets[wk].expenses;
    });

    const monthSalesCount = sales.filter((s: any) => {
      const d = new Date(s.data_venda);
      return !Number.isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const ticketMedio = monthSalesCount > 0 ? monthSalesValue / monthSalesCount : 0;
    const margemMedia = monthSalesValue > 0 ? (monthProfit / monthSalesValue) * 100 : 0;
    const inadimplencia = monthSalesValue > 0
      ? (sales
          .filter((s: any) => {
            const d = new Date(s.data_venda);
            return !Number.isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc: number, s: any) => acc + Math.max(0, Number(s.valor_devido) || 0), 0) / monthSalesValue) * 100
      : 0;

    const stockAlerts = products
      .filter((p: any) => Number(p.estoque_minimo || 0) > 0 && Number(p.quantidade_estoque || 0) <= Number(p.estoque_minimo || 0))
      .map((p: any) => ({
        id: p.id,
        nome: p.nome,
        quantidade_estoque: Number(p.quantidade_estoque || 0),
        estoque_minimo: Number(p.estoque_minimo || 0)
      }))
      .sort((a: any, b: any) => a.quantidade_estoque - b.quantidade_estoque)
      .slice(0, 8);

    const topProductMap: Record<string, { name: string; value: number }> = {};
    for (const sale of sales as any[]) {
      const name = String(sale.item_nome || productById.get(Number(sale.product_id))?.nome || 'Item sem nome');
      if (!topProductMap[name]) topProductMap[name] = { name, value: 0 };
      topProductMap[name].value += Number(sale.valor_venda) || 0;
    }
    const topProduct = Object.values(topProductMap).sort((a, b) => b.value - a.value)[0]?.name || '—';

    const salesByCategory = Object.values(salesByCategoryMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const expensesByCategory = Object.entries(expenseByCategoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const monthlySeries = Object.entries(monthlyBuckets).map(([key, bucket]) => {
      const [year, month] = key.split('-');
      return {
        key,
        label: `${month}/${year.slice(2)}`,
        sales: bucket.sales,
        profit: bucket.profit
      };
    });

    const weeklySeries = Object.entries(weeklyBuckets).map(([key, bucket]) => ({
      key,
      label: key.replace('-', '/'),
      sales: bucket.sales,
      expenses: bucket.expenses,
      net: bucket.net
    }));

    return NextResponse.json({
      stats: {
        products: productsCount || 0,
        categories: categoriesCount || 0,
        sales: salesCount || 0,
        clients: clientsCount || 0,
        totalSalesValue,
        totalProfit,
        totalReceivable,
        monthSalesValue,
        monthProfit,
        monthExpensesValue,
        monthNetValue: monthProfit - monthExpensesValue,
        ticketMedio,
        margemMedia,
        inadimplencia,
        stockAlertsCount: stockAlerts.length,
        topProduct,
        monthSalesCount
      },
      recentSales: recentSales || [],
      charts: {
        monthlySeries,
        weeklySeries,
        salesByCategory,
        expensesByCategory
      },
      stockAlerts
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
