<template>
<v-container grid-list-xl fluid>
  <v-card>
    <v-card-title>
        <v-spacer></v-spacer>
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


</v-container>
</template>

<script>
export default {
  name: 'Default',
  data() {
    return {
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
  actions: {
    type: Object,
    default () {
      const that = this;
      return {
        Cancel: "Cancel",
        OK: {
          text: "OK",
          color: "red",
          handle: () => {
            that.$emit("delete", this.item);
          }
        }
      }
    }
  },
  methods: {
    clearSearch () {
      this.search = '';
    },
    async getDataFromApi () {
      this.loading = true;
      const result = await this.$axios.post(`/api/admin-controller/entity/identities`);

      if (result.data) {
        this.identities = result.data;
        this.totalIdentities = this.identities.total_count;
      }
      this.loading = false;
      this.rowsPerPage=10;
    },
    async sendEnrollment(item) {
      const data = {"email": item.identifier};
      console.log(data)
      await this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
        if (response.status===200) {
          this.$dialog.notify.info(`A new enrollment email was send to {item.identifier}`, { position: 'bottom-right', timeout: 5000 });
        }
      });
    },
    editIdentity(item) {
      console.log('editIdentity');
      this.$dialog.notify.error(`Delete customer triggered but currently disabled`, { position: 'bottom-right', timeout: 2000 });
    },
    deleteIdentity(item) {
      console.log('deleteIdentity');
      this.$dialog.notify.error(`Delete customer triggered but currently disabled`, { position: 'bottom-right', timeout: 2000 });
    },
  }
}
</script>
