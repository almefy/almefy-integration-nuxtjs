<template>

<v-container grid-list-xl fluid>
  <v-card>
    <v-card-title>
        <v-spacer><v-btn @click="reloadIdentities">Reload Identities</v-btn></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          clearable
          clear-icon="mdi-close-circle"
          @click:clear="clearSearch"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="identities"
        :options.sync="options"
        :server-items-length="totalIdentities"
        :loading="loading"
        :search="search"
        :footer-props="rowsPerPageItems"
        :items-per-page="rowsPerPage"
        class="elevation-1 row-pointer">
      >
      <template #[`item.actions`]="{ item }">
        <v-btn icon v-bind="item" @click.stop="sendEnrollment(item)">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon v-bind="item" @click.stop="editIdentity(item)">
            <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon v-bind="item" @click.stop="deleteIdentity(item)">
            <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>


  </v-card>

  <br />

  <v-card>
    <v-row no-gutters>
      <v-col cols="12" md="4">
        <v-container>
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="email"
              label="E-mail"
              :rules="emailRules"
              full-width
            ></v-text-field>
            <v-btn @click="enrollUser">Enroll new identity</v-btn>
          </v-form>
        </v-container>
      </v-col>
    </v-row>
  </v-card>
</v-container>
</template>

<script>

import tokenForm from '~/components/token-management.vue'

export default {
  name: 'Default',
  data() {
    return {
      isFormValid: false,
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(v) || 'E-mail must be valid'
      ],
      totalIdentities: 0,
      identities: [],
      loading: false,
      options: {
          page: 1,
          itemsPerPage: 50,
          sortBy: ['identifier'],
          sortDesc: [false],
      },
      search: '',
      headers: [
        {
          text: '#',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Identifier', value: 'identifier' },
        { text: 'Nickname', value: 'nickname' },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Actions', value: 'actions' },
      ],
      rowsPerPageItems: {
        "items-per-page-options": [5, 10, 20, 50],
      },
      rowsPerPage: 5,
      mode: "edit",
      dialog: false,
    }
  },
  watch: {
    search: {
      handler() {
        this.options.page = 1;
        this.getDataFromApi();
      }
    },
    options: {
      handler () {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    clearSearch () {
      this.search = '';
    },
    async getDataFromApi () {
      this.loading = true;
      const result = await this.$axios.post(`/api/admin-controller/entity/identities`);
      console.log(result);
      if (result.data) {
        this.identities = result.data;
        this.totalIdentities = this.identities.total_count;
      }
      this.loading = false;
      this.rowsPerPage=10;
    },
    async sendEnrollment(item) {
      await this.$dialog.confirm({
        text: `Do you really want to send a new enrollment to ${item.identifier}?`,
        title: 'Send enrollment',
        actions: {
          false: 'No',
          true: {
            color: 'red',
            text: 'Yes I do',
            handle: async () => {
              const data = {"email": item.identifier};
              await this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
                if (response.status===200) {
                  this.$dialog.notify.info(`A new enrollment email was send to ${item.identifier}`, { position: 'bottom-right', timeout: 5000 });
                }
              });
            }
          }
        }
      });
    },
    editIdentity(item) {
      this.$dialog.show(tokenForm, {identifier: item.identifier, parent: this}, { width: "600"})
    },
    async deleteIdentity(item) {
      await this.$dialog.confirm({
        text: `Do you really want to delete the identifier ${item.identifier}?`,
        title: 'Delete identity',
        actions: {
          false: 'No',
          true: {
            color: 'red',
            text: 'Yes I do',
            handle: async () => {
              const data = {"email": item.identifier};
              await this.$axios.post(`${this.$config.removeIdentityUrl}`, data).then((response) => {
                if (response.status===204) {
                  this.$dialog.notify.info(`The identity ${item.identifier} is removed!`, { position: 'bottom-right', timeout: 5000 });
                }
              });
              await this.getDataFromApi();
            }
          }
        }
      });
    },
    async reloadIdentities() {
      await this.getDataFromApi();
      this.$dialog.notify.info(`The grid was reloaded`, { position: 'bottom-right', timeout: 2000 });
    },
    async enrollUser() {

      this.$refs.form.validate();

      if (!this.isFormValid)
        return;

      const data = {"email": this.email};
      const me = this;

      await this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
        if (response.status===200) {
          this.$dialog.notify.info(response.data.message, { position: 'bottom-right', timeout: 10000 });
          me.email="";
          me.showLogin=true;
        } else {
          this.$dialog.notify.error(response.error, { position: 'bottom-right', timeout: 10000 });
        }
      });

      },
  }
}
</script>
