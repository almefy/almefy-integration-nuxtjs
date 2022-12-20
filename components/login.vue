<template>

  <v-app dark>

    <v-container fluid class="fill-height">
      <v-row v-show="showLogin" justify="center">
        <v-col cols="12" sm="6" md="8">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="8" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Sample Login on nuxt.js</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small>
                <v-card-text><v-btn v-show="publicEnrollmentMail || publicEnrollmentLocal" @click="showLogin = !showLogin">Connect user and device here</v-btn></v-card-text>
                </v-card-text>

              </v-col>

              <v-col cols="12" md="4">
                <v-container style="text-align:center; padding-top:30px;padding-right:50px;">
                  <div v-show="!hideAll" >
                  <div v-show="challenge.id==null">Initialising</div>
                  <div v-show="challenge.id!=null">Scan QR-Code if you are already connected</div>
                  <img v-show="challenge.authImages!=null" :src="challenge.authImages['qrcode-standard']" style="width:120px" />
                  </div>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-show="!showLogin" justify="center">
        <v-col cols="12" sm="6" md="8">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="4" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Connect user and device here</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small></v-card-text>
                <v-card-text><v-btn @click="enrollImages = null; email = ''; showLogin = !showLogin">Back to login</v-btn></v-card-text>
              </v-col>
              <v-col cols="12" md="8">
                <v-container style="text-align:center; padding-top:50px;">
                  <v-form ref="form" v-model="isFormValid">

                    <v-text-field
                      v-show="enrollImages==null"
                      v-model="email"
                      label="E-mail"
                      :rules="emailRules"
                      full-width
                    >
                    </v-text-field>

                    <v-container v-show="enrollImages!=null">
                      <div>1. Connect your identity by scanning QR Code with Almefy-App.</div>
                      <div>2. Go Back to login</div>
                      <img :src="'data:image/jpeg;base64,'+ enrollImages" style="width:120px" /><br/>
                      <v-btn @click="enrollUserViaLocal">Get a new connect QR Code</v-btn>
                    </v-container>
                    <v-btn v-show="publicEnrollmentMail && enrollImages==null" @click="enrollUserViaMail">Connect via Mail</v-btn>
                    <v-btn v-show="publicEnrollmentLocal && enrollImages==null" @click="enrollUserViaLocal">Connect direct via Image</v-btn>

                  </v-form>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>

</template>

<script>

  export default {
    layout: 'default',
    data: () => ({
      showLogin: true,
      isFormValid: false,
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(v) || 'E-mail must be valid'
      ],
      hideAll: false,
      challenge: {
        id: null,
        authImages: { 'qrcode-extended': null,  'qrcode-standard': null},
        authTokenUrl: null,
        authType: null,
        pollingUrl: null,
        socketsUrl: null,
        expiresAt: null
      },
      publicEnrollmentMail: false,
      publicEnrollmentLocal: false,
      enrollImages: null,
    }),
    watch: {
      showLogin(newval, oldval) {
        if (!this.showLogin) {
          this.challenge.id = null;
          this.challenge.authImages = { 'qrcode-extended': null,  'qrcode-standard': null }
        } else {
          this.startChallenge();
        }
      }
    },
    mounted() {
      this.publicEnrollmentMail = this.$config.publicEnrollmentMail;
      this.publicEnrollmentLocal = this.$config.publicEnrollmentLocal;
      console.log(this.publicEnrollmentMail);
      console.log(this.publicEnrollmentLocal);
      this.startChallenge();
    },
    methods: {
      startChallenge() {
        const data = {"key": this.$config.accessKey}
        this.$axios.$post(`${this.$config.apiHost}/v1/entity/challenges`, data).then((response) => {
          this.challenge = response;
          this.checkChallenge(response.id);
        });
      },
      enrollUserViaMail() {

        this.$refs.form.validate();

        if (!this.isFormValid)
          return;

        const data = {"email": this.email, "sendEnrollment": true};
        const me = this;

        this.$axios.post(`${this.$config.enrollmentUrl}`, data, {
          validateStatus (status) {
            return status < 500; // Resolve only if the status code is less than 500
          }
        }).then((response) => {
          if (response.status===200) {
            this.$dialog.notify.info(response.data.message, { position: 'bottom-right', timeout: 10000 });
            me.email="";
            me.showLogin=true;
          } else {
            this.$dialog.notify.error(response.data.detail, { position: 'bottom-right', timeout: 10000 });
          }
        });

      },
      enrollUserViaLocal() {

        this.$refs.form.validate();

        if (!this.isFormValid)
          return;

        const data = {"email": this.email, "sendEnrollment": false};
        // const me = this;

        this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
          if (response.status===200) {
            this.enrollImages = response.data.base64ImageData;
            console.log(this.enrollImages);
          } else {
            this.$dialog.notify.error(response.error, { position: 'bottom-right', timeout: 10000 });
          }
        });
      },
      checkChallenge(challengeId) {
        this.$axios.get(this.challenge.pollingUrl).then((response) => {
          if (response.status===204 && this.showLogin) {
            this.checkChallenge(challengeId);
          } else if (response.status===200)  {
            this.$axios.get(`${this.$config.authControllerUrl}`, {
              headers: { 'X-Almefy-Auth': response.data.token }
            }).then(response => {
              if (response.status===200) {
                console.log('Got the roundtrip completly, create own JWT token based on secret with identity');
                location.reload(this.$config.homeRoute)
              }
            })
          } else {
            // this should die cause of....
          }
        });

      }
    }
  };
</script>
<style scoped lang="css">
</style>




