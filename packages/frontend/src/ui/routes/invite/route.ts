import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { isPresent } from '@ember/utils';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

import InviteController from './controller';
import ContactManager from 'emberclear/services/contact-manager';
import ChannelManager from 'emberclear/services/channel-manager';
import IdentityService from 'emberclear/services/identity/service';

export default class InviteRoute extends Route {
  @service toast!: Toast;
  @service identity!: IdentityService;
  @service contactManager!: ContactManager;
  @service channelManager!: ChannelManager;

  @disableInFastboot
  beforeModel() {
    // identity should be loaded from application route
    if (this.identity.isLoggedIn) return;

    // no identity, need to create one
    this.transitionTo('setup');
  }

  @disableInFastboot
  async setupController(controller: InviteController, model: never) {
    this._super(controller, model);

    if (this.hasParams()) {
      const { name, publicKey } = controller;

      // if (isPresent(publicKey)) {
        return await this.acceptContactInvite(name!, publicKey!);
      // }
    }

    this.toast.error('Invalid Invite Link');
    return this.transitionTo('chat');
  }

  private async acceptContactInvite(name: string, publicKey: string) {
    if (publicKey === this.identity.record!.publicKeyAsHex) {
      this.toast.warning(`You can't invite yourself.. but you can talk to yourself!`);

      return this.transitionTo('/chat/privately-with/me');
    }

    try {
      await this.contactManager.findOrCreate(publicKey!, name!);
    } catch (e) {
      this.toast.error(`There was a problem importing ${name}: ${e.message}`);
      return this.transitionTo('chat');
    }

    this.toast.success(`${name} has been successfully imported!`);
    return this.transitionTo(`/chat/privately-with/${publicKey}`);
  }

  private hasParams() {
    const { name, publicKey } = this.controller as InviteController;

    // TODO: support additional / different params for private channels
    return isPresent(name) && isPresent(publicKey);
  }
}
