#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { PocAwsCdkStack } from './src/poc-aws-cdk-stack';

dotenv.config();

const app = new cdk.App();

// Parametros Globales Estandarizados (Nomenclatura)
const projectNameContext = process.env.PROJECT_NAME;
const environmentContext = process.env.ENVIRONMENT;

// Parametros de Red (Networking)
const vpcCidrContext = process.env.VPC_CIDR;
const subnetCidrMaskContext = process.env.SUBNET_CIDR_MASK;
const maxAzsContext = process.env.MAX_AZS;
const enableNatGatewaysContext = process.env.ENABLE_NAT_GATEWAYS;

const projectName = typeof projectNameContext === 'string' ? projectNameContext : 'poc';
const environment = typeof environmentContext === 'string' ? environmentContext : 'dev';

const vpcCidr = typeof vpcCidrContext === 'string' ? vpcCidrContext : undefined;
const subnetCidrMask = subnetCidrMaskContext ? parseInt(String(subnetCidrMaskContext), 10) : undefined;
const maxAzs = maxAzsContext ? parseInt(String(maxAzsContext), 10) : undefined;
const enableNatGateways = String(enableNatGatewaysContext).toLowerCase() === 'true';

new PocAwsCdkStack(app, 'PocAwsCdkStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    },
    projectName: projectName,
    environment: environment,
    vpcCidr: vpcCidr,
    subnetCidrMask: subnetCidrMask,
    maxAzs: maxAzs,
    enableNatGateways: enableNatGateways
});
