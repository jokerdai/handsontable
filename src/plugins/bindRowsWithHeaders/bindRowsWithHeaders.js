import BasePlugin from '../../plugins/_base';
import { registerPlugin } from '../../plugins';
import LooseBindsMap from './maps/looseBindsMap';
import StrictBindsMap from './maps/strictBindsMap';

const DEFAULT_BIND = 'loose';

const bindTypeToMapStrategy = new Map([
  ['loose', LooseBindsMap],
  ['strict', StrictBindsMap]
]);

/**
 * @plugin BindRowsWithHeaders
 *
 * @description
 * Plugin allows binding the table rows with their headers.
 *
 * If the plugin is enabled, the table row headers will "stick" to the rows, when they are hidden/moved. Basically, if
 * at the initialization row 0 has a header titled "A", it will have it no matter what you do with the table.
 *
 * @example
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   date: getData(),
 *   // enable plugin
 *   bindRowsWithHeaders: true
 * });
 * ```
 */
class BindRowsWithHeaders extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
    /**
     * Plugin indexes cache.
     *
     * @private
     * @type {null|IndexToValueMap}
     */
    this.headerIndexes = null;
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link BindRowsWithHeaders#enablePlugin} method is called.
   *
   * @returns {Boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings().bindRowsWithHeaders;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }

    let bindType = this.hot.getSettings().bindRowsWithHeaders;

    if (typeof bindType !== 'string') {
      bindType = DEFAULT_BIND;
    }

    const MapStrategy = bindTypeToMapStrategy.get(bindType);

    this.headerIndexes = this.rowIndexMapper.variousMappingsCollection.register('bindRowsWithHeaders', new MapStrategy());

    this.addHook('modifyRowHeader', row => this.onModifyRowHeader(row));

    super.enablePlugin();
  }

  /**
   * On modify row header listener.
   *
   * @private
   * @param {Number} row Row index.
   * @returns {Number}
   *
   * @fires Hooks#modifyRow
   */
  onModifyRowHeader(row) {
    return this.headerIndexes.getValueAtIndex(this.rowIndexMapper.getPhysicalIndex(row));
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.rowIndexMapper.skipCollection.unregister('bindRowsWithHeaders');

    super.destroy();
  }
}

registerPlugin('bindRowsWithHeaders', BindRowsWithHeaders);

export default BindRowsWithHeaders;
