import React from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function roiColor(score) {
  if (score >= 0.05) return '#22c55e';
  if (score >= 0.02) return '#eab308';
  return '#ef4444';
}

export default function ROICharts({ results }) {
  const top20 = results.slice(0, 20);

  const barData = top20.map((r) => ({
    name: r.property.address.split(' ').slice(0, 2).join(' '),
    roi: parseFloat((r.roiScore * 100).toFixed(2)),
    score: r.roiScore,
  }));

  const scatterData = results.map((r) => ({
    price: r.property.price,
    roi: parseFloat((r.roiScore * 100).toFixed(2)),
    score: r.roiScore,
    id: r.property.id,
  }));

  const rentData = top20
    .filter((r) => r.rentalRate)
    .map((r) => ({
      name: r.property.address.split(' ').slice(0, 2).join(' '),
      rent: r.rentalRate.estimatedMonthlyRent,
    }));

  return (
    <div className="roi-charts">
      <section aria-label="Top 20 properties by ROI score">
        <h3>Top 20 Properties — ROI Score</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="roi" name="ROI Score">
              {barData.map((entry, i) => (
                <Cell key={i} fill={roiColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section aria-label="Price vs ROI scatter chart">
        <h3>Price vs. ROI Score</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="price" name="Price" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis dataKey="roi" name="ROI" tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v, name) => name === 'Price' ? `$${v.toLocaleString()}` : `${v}%`} />
            <Scatter data={scatterData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {rentData.length > 0 && (
        <section aria-label="Estimated monthly rent chart">
          <h3>Estimated Monthly Rent — Top 20</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rentData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}/mo`} />
              <Bar dataKey="rent" name="Est. Monthly Rent" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
