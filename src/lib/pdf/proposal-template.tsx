/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const NAVY = '#0A1628';
const CARD_NAVY = '#0F1F36';
const ELECTRIC_BLUE = '#2563EB';
const EMERALD = '#10B981';
const WHITE = '#FFFFFF';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_600 = '#4B5563';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: ELECTRIC_BLUE,
    paddingBottom: 15,
  },
  logo: {
    width: 140,
    height: 45,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 10,
    color: GRAY_500,
  },
  headerQuote: {
    fontSize: 12,
    fontWeight: 'bold',
    color: NAVY,
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: GRAY_500,
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: ELECTRIC_BLUE,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    color: GRAY_500,
    width: '45%',
  },
  value: {
    fontSize: 10,
    color: NAVY,
    width: '55%',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  pricingTable: {
    marginTop: 5,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pricingLabel: {
    fontSize: 10,
    color: GRAY_500,
  },
  pricingValue: {
    fontSize: 10,
    color: NAVY,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: ELECTRIC_BLUE,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: NAVY,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: EMERALD,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  depositLabel: {
    fontSize: 9,
    color: GRAY_400,
  },
  depositValue: {
    fontSize: 9,
    color: GRAY_600,
    fontWeight: 'bold',
  },
  roiSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  roiMetric: {
    alignItems: 'center',
  },
  roiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ELECTRIC_BLUE,
  },
  roiLabel: {
    fontSize: 8,
    color: GRAY_500,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: GRAY_400,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    textAlign: 'right',
  },
});

interface ProposalPDFProps {
  quoteNumber: string;
  customerName: string;
  address: string;
  inverterModel: string;
  batteryCap: string;
  solarCap: string;
  panelCount: string;
  systemCost: number;
  hardwareCost: number;
  installationFee: number;
  designFee: number;
  permitFee: number;
  depositPct: number;
  validUntil: string;
  year1Savings: number;
  lifetimeSavings: number;
  paybackYears: number;
  irr: number;
  chartDataUri?: string;
}

export function ProposalPDF({
  quoteNumber,
  customerName,
  address,
  inverterModel,
  batteryCap,
  solarCap,
  panelCount,
  systemCost,
  hardwareCost,
  installationFee,
  designFee,
  permitFee,
  depositPct,
  validUntil,
  year1Savings,
  lifetimeSavings,
  paybackYears,
  irr,
  chartDataUri,
}: ProposalPDFProps) {
  const depositAmount = systemCost * (depositPct / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Solar PV System Proposal</Text>
            <Text style={styles.headerQuote}>{quoteNumber}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.title}>System Design & Investment Summary</Text>
          <Text style={styles.subtitle}>Prepared for: {customerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Specifications</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Solar PV Capacity</Text>
            <Text style={styles.value}>{solarCap}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Solar Panels</Text>
            <Text style={styles.value}>{panelCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inverter</Text>
            <Text style={styles.value}>{inverterModel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Battery Storage</Text>
            <Text style={styles.value}>{batteryCap}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Installation Address</Text>
            <Text style={styles.value}>{address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Breakdown</Text>
          <View style={styles.pricingTable}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Solar Hardware & Equipment</Text>
              <Text style={styles.pricingValue}>₱{hardwareCost.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Professional Installation</Text>
              <Text style={styles.pricingValue}>₱{installationFee.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Design & Engineering</Text>
              <Text style={styles.pricingValue}>₱{designFee.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Permits & DU Filing</Text>
              <Text style={styles.pricingValue}>₱{permitFee.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Investment (VAT Inclusive)</Text>
              <Text style={styles.totalValue}>₱{systemCost.toLocaleString()}</Text>
            </View>
            <View style={styles.depositRow}>
              <Text style={styles.depositLabel}>Required Deposit ({depositPct}%)</Text>
              <Text style={styles.depositValue}>₱{depositAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Return on Investment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Year 1 Savings</Text>
            <Text style={styles.value}>₱{year1Savings.toLocaleString()}/yr</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Simple Payback Period</Text>
            <Text style={styles.value}>{paybackYears.toFixed(1)} Years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>25-Year Lifetime Savings</Text>
            <Text style={styles.value}>₱{lifetimeSavings.toLocaleString()}</Text>
          </View>
          <View style={styles.roiSummary}>
            <View style={styles.roiMetric}>
              <Text style={styles.roiValue}>{paybackYears.toFixed(1)}yr</Text>
              <Text style={styles.roiLabel}>Payback</Text>
            </View>
            <View style={styles.roiMetric}>
              <Text style={styles.roiValue}>{irr.toFixed(1)}%</Text>
              <Text style={styles.roiLabel}>IRR</Text>
            </View>
            <View style={styles.roiMetric}>
              <Text style={styles.roiValue}>₱{year1Savings.toLocaleString()}</Text>
              <Text style={styles.roiLabel}>Year 1 Savings</Text>
            </View>
            <View style={styles.roiMetric}>
              <Text style={styles.roiValue}>₱{lifetimeSavings.toLocaleString()}</Text>
              <Text style={styles.roiLabel}>25-Year Savings</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warranty & Support</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Solar Panels</Text>
            <Text style={styles.value}>25-Year Performance Warranty</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inverter</Text>
            <Text style={styles.value}>10-Year Manufacturer Warranty</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Battery Storage</Text>
            <Text style={styles.value}>10-Year Warranty</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Workmanship</Text>
            <Text style={styles.value}>5-Year Installation Warranty</Text>
          </View>
        </View>

        {chartDataUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>25-Year Cumulative Cash Flow</Text>
            <Image src={chartDataUri} style={{ marginTop: 10, width: '100%', height: 180, objectFit: 'contain' }} />
          </View>
        )}

        <Text style={styles.footer}>
          <Text style={styles.footerLeft}>
            Proposal {quoteNumber} · Valid until {validUntil}{'\n'}
            OptiCore Energy Solutions · +63 950 469 2442
          </Text>
          <Text style={styles.footerRight}>
            www.opticore.ph · engineering@opticore.ph{'\n'}
            This is an engineering estimate. Final pricing subject to site survey.
          </Text>
        </Text>
      </Page>
    </Document>
  );
}
