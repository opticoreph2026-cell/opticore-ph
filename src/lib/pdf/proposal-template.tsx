/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register standard fonts if needed, e.g.:
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#F5A524',
    paddingBottom: 10,
  },
  logoPlaceholder: {
    width: 150,
    height: 40,
    backgroundColor: '#08080B',
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#08080B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#08080B',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    color: '#666666',
    width: '40%',
  },
  value: {
    fontSize: 11,
    color: '#08080B',
    width: '60%',
    fontWeight: 'bold',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  costLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#08080B',
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  chartImage: {
    marginTop: 20,
    width: '100%',
    height: 200,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
});

interface ProposalPDFProps {
  customerName: string;
  address: string;
  inverterModel: string;
  batteryCap: string;
  solarCap: string;
  systemCost: number;
  year1Savings: number;
  lifetimeSavings: number;
  paybackYears: number;
  chartDataUri?: string; // Data URI for the rendered chart
}

export function ProposalPDF({
  customerName,
  address,
  inverterModel,
  batteryCap,
  solarCap,
  systemCost,
  year1Savings,
  lifetimeSavings,
  paybackYears,
  chartDataUri,
}: ProposalPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text>OptiCore Energy</Text>
          </View>
          <View>
            <Text style={styles.headerText}>Engineering Proposal</Text>
            <Text style={styles.headerText}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.title}>System Design & ROI Proposal</Text>
          <Text style={styles.subtitle}>Prepared for: {customerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Specifications</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Inverter / Brain:</Text>
            <Text style={styles.value}>{inverterModel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Battery Storage:</Text>
            <Text style={styles.value}>{batteryCap} kWh LFP</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Solar PV Capacity:</Text>
            <Text style={styles.value}>{solarCap} kWp</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Installation Address:</Text>
            <Text style={styles.value}>{address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Year 1 Savings:</Text>
            <Text style={styles.value}>₱{year1Savings.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Payback Period:</Text>
            <Text style={styles.value}>{paybackYears.toFixed(1)} Years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>25-Year Lifetime Savings:</Text>
            <Text style={styles.value}>₱{lifetimeSavings.toLocaleString()}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Total Turnkey Investment:</Text>
            <Text style={styles.costValue}>₱{systemCost.toLocaleString()}</Text>
          </View>
        </View>

        {chartDataUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>25-Year Cumulative Cash Flow</Text>
            <Image src={chartDataUri} style={styles.chartImage} alt="" />
          </View>
        )}

        <Text style={styles.footer}>
          This proposal is an engineering estimate based on the provided load profile and utility rates. 
          Final pricing is subject to a formal site survey and engineering sign-off.
          OptiCore Energy Solutions | www.opticore.ph | engineering@opticore.ph
        </Text>
      </Page>
    </Document>
  );
}
