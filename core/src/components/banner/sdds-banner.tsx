import { Component, Host, h, Prop, Event, EventEmitter, Method, Element } from '@stencil/core';
import { State } from '@stencil/core/internal';

@Component({
  tag: 'sdds-banner',
  styleUrl: 'sdds-banner.scss',
  shadow: true,
})
export class SddsBanner {
  @Element() host: HTMLElement;

  /** Name of the icon for the component. For error and information type the icon is predefined. */
  @Prop() icon: string;

  /** Header text. */
  @Prop() header: string;

  /** Type of Banner */
  @Prop() type: 'error' | 'information' | 'none' = 'none';

  /** ID used for internal table functionality and events, must be unique.
   *
   * **NOTE**: If you're listening for Banner close events you need to set this ID yourself to identify the Banner, as the default ID is random and will be different every time.
   */
  @Prop() bannerId: string = crypto.randomUUID();

  /** Removes the close button on the Banner. */
  @Prop() persistent: boolean = false;

  /** Hides the Banner */
  @Prop() hidden = false;

  @State() hasSubheader: boolean;

  @State() hasLink: boolean;

  /** Sends a unique Banner identifier when the close button is pressed. */
  @Event({
    eventName: 'sddsClose',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  sddsClose: EventEmitter<{
    bannerId: string;
  }>;

  /** Sends the unique Banner identifier when the close button is pressed. */
  @Event({
    eventName: 'sddsShow',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  sddsShow: EventEmitter<{
    bannerId: string;
  }>;

  /** Hides the Banner. */
  @Method()
  async hideBanner() {
    this.handleClose();
  }

  /** Shows the Banner */
  @Method()
  async showBanner() {
    this.handleShow();
  }

  connectedCallback() {
    if (this.type === 'error') {
      this.icon = 'error';
    } else if (this.type === 'information') {
      this.icon = 'info';
    }
    const children = Array.from(this.host.children);
    this.hasSubheader = children.some((childElement) => childElement.slot === 'banner-subheader');
    this.hasLink = children.some((childElement) => childElement.slot === 'banner-link');
  }

  handleClose = () => {
    const sddsCloseEvent = this.sddsClose.emit({
      bannerId: this.bannerId,
    });
    if (!sddsCloseEvent.defaultPrevented) {
      this.hidden = true;
    }
  };

  handleShow = () => {
    const sddsCloseEvent = this.sddsShow.emit({
      bannerId: this.bannerId,
    });
    if (!sddsCloseEvent.defaultPrevented) {
      this.hidden = false;
    }
  };

  render() {
    return (
      <Host
        role="banner"
        aria-hidden={`${this.hidden}`}
        aria-live={
          this.host.getAttribute('aria-live') ? this.host.getAttribute('aria-live') : 'polite'
        }
        aria-atomic={this.host.getAttribute('aria-atomic')}
        class={`${this.type} ${this.hidden ? 'hide' : 'show'}`}
      >
        {this.icon && (
          <div class={`banner-icon ${this.type}`}>
            <sdds-icon name={this.icon} size="20px"></sdds-icon>
          </div>
        )}
        <div class={`banner-content ${this.type} ${!this.icon ? 'no-icon' : ''}`}>
          {this.header && <span class={`banner-header`}>{this.header}</span>}
          {this.hasSubheader && <slot name="banner-subheader"></slot>}
          {this.hasLink && (
            <div class={`banner-link ${!this.hasSubheader ? 'no-subheader' : ''}`}>
              <slot name="banner-link"></slot>
            </div>
          )}
        </div>
        {!this.persistent && (
          <div class={`banner-close`}>
            <button
              onClick={() => {
                this.handleClose();
              }}
            >
              <sdds-icon name="cross" size="20px"></sdds-icon>
            </button>
          </div>
        )}
      </Host>
    );
  }
}
