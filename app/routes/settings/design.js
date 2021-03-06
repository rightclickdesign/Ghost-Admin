import $ from 'jquery';
import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import styleBody from 'ghost-admin/mixins/style-body';
import RSVP from 'rsvp';

export default AuthenticatedRoute.extend(styleBody, CurrentUserSettings, {
    titleToken: 'Settings - Design',

    classNames: ['settings-view-design'],

    // TODO: replace with a synchronous settings service
    querySettings() {
        return this.store.queryRecord('setting', {type: 'blog,theme,private'});
    },

    beforeModel() {
        this._super(...arguments);
        return this.get('session.user')
            .then(this.transitionAuthor());
    },

    model() {
        return RSVP.hash({
            settings: this.querySettings(),
            themes: this.get('store').findAll('theme')
        });
    },

    setupController(controller, models) {
        controller.set('model', models.settings);
        controller.set('themes', this.get('store').peekAll('theme'));
        this.get('controller').send('reset');
    },

    actions: {
        save() {
            // since shortcuts are run on the route, we have to signal to the components
            // on the page that we're about to save.
            $('.page-actions .gh-btn-blue').focus();

            this.get('controller').send('save');
        },

        willTransition() {
            // reset the model so that our CPs re-calc and unsaved changes aren't
            // persisted across transitions
            this.set('controller.model', null);
            return this._super(...arguments);
        },

        reloadThemes() {
            return this.get('store').findAll('theme');
        },

        activateTheme(theme) {
            return this.get('controller').send('setTheme', theme);
        }
    }
});
