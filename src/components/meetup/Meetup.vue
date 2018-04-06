<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs12>
                <v-card>
                    <v-card-title><h1 class="primary--text">My Meetup</h1></v-card-title>
                    <v-card-media src="https://i.ytimg.com/vi/MtCMtC50gwY/maxresdefault.jpg" height="400px"></v-card-media>
                    <v-card-text>
                        <div class="info--text">17th July 2017 - Location</div>
                        <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sem ligula, venenatis vitae sem at, euismod laoreet eros. Sed porta ex id vehicula sodales. Ut et neque quis sem venenatis pellentesque. Fusce sollicitudin diam volutpat lacus varius rhoncus. Fusce egestas dapibus mi eget condimentum. Cras eu volutpat est. Integer quis arcu ut tellus mattis ornare. Duis eget est arcu.</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn class="primary">Register</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        name: 'Meetup'
    }
</script>

<style scoped>

</style>
