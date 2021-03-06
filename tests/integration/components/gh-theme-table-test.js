/* jshint expr:true */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import sinon from 'sinon';
import run from 'ember-runloop';
import testSelector from 'ember-test-selectors';

describe('Integration: Component: gh-theme-table', function() {
    setupComponentTest('gh-theme-table', {
        integration: true
    });

    it('renders', function() {
        this.set('themes', [
            {name: 'Daring', package: {name: 'Daring', version: '0.1.4'}},
            {name: 'casper', package: {name: 'Casper', version: '1.3.1'}},
            {name: 'oscar-ghost-1.1.0', package: {name: 'Lanyon', version: '1.1.0'}},
            {name: 'foo'}
        ]);
        this.set('actionHandler', sinon.spy());

        this.render(hbs`{{gh-theme-table
            themes=themes
            activeTheme="Daring"
            activateTheme=(action actionHandler)
            downloadTheme=(action actionHandler)
            deleteTheme=(action actionHandler)
        }}`);

        expect(this.$(testSelector('themes-list')).length, 'themes list is present').to.equal(1);
        expect(this.$(testSelector('theme-id')).length, 'number of rows').to.equal(4);

        let packageNames = this.$(testSelector('theme-title')).map((i, name) => {
            return $(name).text().trim();
        }).toArray();

        expect(
            packageNames,
            'themes are ordered by label, casper has "default"'
        ).to.deep.equal([
            'Casper (default)',
            'Daring',
            'foo',
            'Lanyon'
        ]);

        expect(
            this.$(testSelector('theme-active', 'true')).find(testSelector('theme-title')).text().trim(),
            'active theme is highlighted'
        ).to.equal('Daring');

        expect(
            this.$(testSelector('theme-activate-button')).length === 3,
            'non-active themes have an activate link'
        ).to.be.true;

        expect(
            this.$(testSelector('theme-active', 'true')).find(testSelector('theme-activate-button')).length === 0,
            'active theme doesn\'t have an activate link'
        ).to.be.true;

        expect(
            this.$(testSelector('theme-download-button')).length,
            'all themes have a download link'
        ).to.equal(4);

        expect(
            this.$(testSelector('theme-id', 'foo')).find(testSelector('theme-delete-button')).length === 1,
            'non-active, non-casper theme has delete link'
        ).to.be.true;

        expect(
            this.$(testSelector('theme-id', 'casper')).find(testSelector('theme-delete-button')).length === 0,
            'casper doesn\'t have delete link'
        ).to.be.true;

        expect(
            this.$(testSelector('theme-active', 'true')).find(testSelector('theme-delete-button')).length === 0,
            'active theme doesn\'t have delete link'
        ).to.be.true;
    });

    it('delete link triggers passed in action', function () {
        let deleteAction = sinon.spy();
        let actionHandler = sinon.spy();

        this.set('themes', [
            {name: 'Foo', active: true},
            {name: 'Bar'}
        ]);
        this.set('deleteAction', deleteAction);
        this.set('actionHandler', actionHandler);

        this.render(hbs`{{gh-theme-table
            themes=themes
            activateTheme=(action actionHandler)
            downloadTheme=(action actionHandler)
            deleteTheme=(action deleteAction)
        }}`);

        run(() => {
            this.$(`${testSelector('theme-id', 'Bar')} ${testSelector('theme-delete-button')}`).click();
        });

        expect(deleteAction.calledOnce).to.be.true;
        expect(deleteAction.firstCall.args[0].name).to.equal('Bar');
    });

    it('download link triggers passed in action', function () {
        let downloadAction = sinon.spy();
        let actionHandler = sinon.spy();

        this.set('themes', [
            {name: 'Foo', active: true},
            {name: 'Bar'}
        ]);
        this.set('downloadAction', downloadAction);
        this.set('actionHandler', actionHandler);

        this.render(hbs`{{gh-theme-table
            themes=themes
            activateTheme=(action actionHandler)
            downloadTheme=(action downloadAction)
            deleteTheme=(action actionHandler)
        }}`);

        run(() => {
            this.$(`${testSelector('theme-id', 'Foo')} ${testSelector('theme-download-button')}`).click();
        });

        expect(downloadAction.calledOnce).to.be.true;
        expect(downloadAction.firstCall.args[0].name).to.equal('Foo');
    });

    it('activate link triggers passed in action', function () {
        let activateAction = sinon.spy();
        let actionHandler = sinon.spy();

        this.set('themes', [
            {name: 'Foo', active: true},
            {name: 'Bar'}
        ]);
        this.set('activateAction', activateAction);
        this.set('actionHandler', actionHandler);

        this.render(hbs`{{gh-theme-table
            themes=themes
            activateTheme=(action activateAction)
            downloadTheme=(action actionHandler)
            deleteTheme=(action actionHandler)
        }}`);

        run(() => {
            this.$(`${testSelector('theme-id', 'Bar')} ${testSelector('theme-activate-button')}`).click();
        });

        expect(activateAction.calledOnce).to.be.true;
        expect(activateAction.firstCall.args[0].name).to.equal('Bar');
    });

    it('displays folder names if there are duplicate package names', function () {
        this.set('themes', [
            {name: 'daring', package: {name: 'Daring', version: '0.1.4'}, active: true},
            {name: 'daring-0.1.5', package: {name: 'Daring', version: '0.1.4'}},
            {name: 'casper', package: {name: 'Casper', version: '1.3.1'}},
            {name: 'another', package: {name: 'Casper', version: '1.3.1'}},
            {name: 'mine', package: {name: 'Casper', version: '1.3.1'}},
            {name: 'foo'}
        ]);
        this.set('actionHandler', sinon.spy());

        this.render(hbs`{{gh-theme-table
            themes=themes
            activateTheme=(action actionHandler)
            downloadTheme=(action actionHandler)
            deleteTheme=(action actionHandler)
        }}`);

        let packageNames = this.$(testSelector('theme-title')).map((i, name) => {
            return $(name).text().trim();
        }).toArray();

        expect(
            packageNames,
            'themes are ordered by label, folder names shown for duplicates'
        ).to.deep.equal([
            'Casper (another)',
            'Casper (default)',
            'Casper (mine)',
            'Daring (daring)',
            'Daring (daring-0.1.5)',
            'foo'
        ]);
    });
});
