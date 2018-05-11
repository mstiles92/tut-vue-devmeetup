<template>
    <v-dialog persistent v-model="registerDialog" max-width="500px">
        <v-btn color="primary" slot="activator">
            {{ userIsRegistered ? 'Unregister' : 'Register' }}
        </v-btn>
        <v-card>
            <v-container>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-title v-if="userIsRegistered">Unregister from Meetup?</v-card-title>
                        <v-card-title v-else>Register for Meetup?</v-card-title>
                    </v-flex>
                </v-layout>
                <v-divider></v-divider>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-text>You can always change your decision later on.</v-card-text>
                    </v-flex>
                </v-layout>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-actions>
                            <v-btn class="red--text darken-1" flat @click="registerDialog = false">Cancel</v-btn>
                            <v-btn class="green--text darken-1" flat @click="onAgree">Confirm</v-btn>
                        </v-card-actions>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import { Actions } from '@/store/definitions'

    export default {
        data() {
            return {
                registerDialog: false
            }
        },
        props: ['meetupId'],
        computed: {
            userIsRegistered() {
                return this.$store.getters.user.registeredMeetups.findIndex(meetupId => meetupId === this.meetupId) >= 0
            }
        },
        methods: {
            onAgree() {
                if (this.userIsRegistered) {
                    this.$store.dispatch(Actions.UNREGISTER_USER_FROM_MEETUP, this.meetupId)
                } else {
                    this.$store.dispatch(Actions.REGISTER_USER_FOR_MEETUP, this.meetupId)
                }
            }
        }
    }
</script>
