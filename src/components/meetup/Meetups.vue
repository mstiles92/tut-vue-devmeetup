<template>
    <v-container>
        <v-layout row wrap v-for="meetup in meetups" :key="meetup.id" class="mb-2">
            <v-flex xs12 sm10 md8 offset-sm1 offset-sm2>
                <app-meetup-card :meetup="meetup"></app-meetup-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        computed: {
            meetups() {
                return this.$store.getters.loadedMeetups
            }
        }
    }
</script>
