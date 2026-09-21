import type { ComponentType } from 'react';
import type { ChatConfig, TemplateId } from '../../types';
import IMessageTemplate from './IMessageTemplate';
import MessengerTemplate from './MessengerTemplate';
import TwitterTemplate from './TwitterTemplate';
import TweetTemplate from './TweetTemplate';
import FacebookPostTemplate from './FacebookPostTemplate';

export const TEMPLATE_REGISTRY: Record<TemplateId, ComponentType<{ config: ChatConfig }>> = {
  imessage: IMessageTemplate,
  messenger: MessengerTemplate,
  twitter: TwitterTemplate,
  'twitter-post': TweetTemplate,
  'facebook-post': FacebookPostTemplate,
};

export function TemplateRenderer({ id, config }: { id: TemplateId; config: ChatConfig }) {
  const Template = TEMPLATE_REGISTRY[id];
  return <Template config={config} />;
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  imessage: 'iMessage',
  messenger: 'Messenger',
  twitter: 'X (Twitter)',
  'twitter-post': 'X · Post',
  'facebook-post': 'Facebook Post',
};