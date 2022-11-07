<template>
  <DialogCard title="Login" :actions="actions">
    <v-card>
        <v-data-table
          :headers="headers"
          :items="tokens"
          :options.sync="options"
          :server-items-length="totalTokens"
          :loading="loading"
          :search="search"
          :footer-props="rowsPerPageItems"
          :items-per-page="rowsPerPage"
          class="elevation-1 row-pointer">
        >
        <template #[`item.actions`]="{ item }">
          <v-btn icon v-bind="item" @click.stop="deleteToken(item)">
              <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </DialogCard>
</template>
<script>
export default {
  props: {
    identifier: {
      default: '',
      type: String
    }
  },
  // overlay: 'default',
  //   asyncData () {
  //         return new Promise(resolve => {
  //           setTimeout(resolve, 3000)
  //         })
  // },
  data () {
    return {
      totalTokens: 0,
      tokens: [],
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
        { text: 'Model', value: 'model' },
        { text: 'Label', value: 'label' },
        { text: 'Name', value: 'name' },
        { text: 'Actions', value: 'actions' },
      ],
      rowsPerPageItems: {
        "items-per-page-options": [5, 10, 20, 50],
      },
      rowsPerPage: 5,
      mode: "edit",
    }
  },
  computed: {
    actions () {
      return {
        close: {
          flat: true,
          text: 'Close'
        }
      }
    }
  },
  watch: {
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
      const data = {email: this.identifier}
      const result = await this.$axios.post(`/api/admin-controller/entity/identities`, data);

      if (result.data) {
        this.identities = result.data;
        this.totalIdentities = this.identities.total_count;
      }
      this.loading = false;
      this.rowsPerPage=10;
    }
  }
}
</script>
