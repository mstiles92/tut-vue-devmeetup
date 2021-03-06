<template>
    <v-container>
        <v-layout row wrap v-if="loading || !meetup">
            <v-flex xs12 class="text-xs-center">
                <v-progress-circular
                    indeterminate
                    class="primary--text"
                    :width="7"
                    :size="70"
                    v-if="loading"
                ></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout row wrap v-else>
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                        <h1 class="primary--text">{{ meetup.title }}</h1>
                        <template v-if="userIsRegistered">
                            <v-spacer></v-spacer>
                            <h1 class="accent--text">Registered!</h1>
                        </template>
                        <template v-if="userIsCreator">
                            <v-spacer></v-spacer>
                            <app-edit-meetup-details-dialog :meetup="meetup"></app-edit-meetup-details-dialog>
                            <app-delete-meetup-dialog :meetup="meetup"></app-delete-meetup-dialog>
                        </template>
                    </v-card-title>
                    <v-card-media :src="meetup.imageUrl" height="400px"></v-card-media>
                    <v-card-text>
                        <div class="info--text">{{ meetup.date | date }} - {{ meetup.location }}</div>
                        <div class="info--text">Organized by {{ meetup.creatorName }}</div>
                        <div>
                            <app-edit-meetup-date-dialog :meetup="meetup" v-if="userIsCreator"></app-edit-meetup-date-dialog>
                            <app-edit-meetup-time-dialog :meetup="meetup" v-if="userIsCreator"></app-edit-meetup-time-dialog>
                        </div>
                        <div>{{ meetup.description }}</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <app-meetup-register-dialog :meetup-id="meetup.id" v-if="userIsAuthenticated && !userIsCreator"></app-meetup-register-dialog>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        props: ['id'],
        computed: {
            meetup() {
                return this.$store.getters.loadedMeetup(this.id)
            },
            userIsAuthenticated() {
                return this.$store.getters.user !== null && this.$store.getters.user !== undefined
            },
            userIsCreator() {
                return this.userIsAuthenticated && this.$store.getters.user.id === this.meetup.creatorId
            },
            userIsRegistered() {
                return this.userIsAuthenticated && this.$store.getters.user.registeredMeetups.includes(this.meetup.id)
            },
            loading() {
                return this.$store.getters.loading
            }
        }
    }
</script>
