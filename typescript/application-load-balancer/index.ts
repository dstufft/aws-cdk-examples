#!/usr/bin/env node
import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/cdk');

class LoadBalancerStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const vpc = new ec2.VpcNetwork(this, 'VPC');

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: new ec2.InstanceTypePair(ec2.InstanceClass.Burstable2, ec2.InstanceSize.Micro),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [asg]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

    asg.scaleOnRequestCount('AModestLoad', {
      targetRequestsPerSecond: 1
    });
  }
}

const app = new cdk.App();
new LoadBalancerStack(app, 'LoadBalancerStack');
app.run();
