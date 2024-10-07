<template>
  <v-container class="pokemon-info">
    <h1 class="text-center">Pokémon Info</h1>

    <div v-if="isLoading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="text-center">Ładowanie...</div>
    </div>

    <v-alert v-else-if="error" type="error">{{ error.message }}</v-alert>

    <v-row v-else>
      <v-col v-for="pokemon in data" :key="pokemon.name" cols="12" md="3">
        <v-card :style="getCardStyle(pokemon.types)" class="pokemon-card">
          <v-img :src="pokemon.image" height="12em"></v-img>
          <v-card-title class="text-h6 text-center" :style="getCardStyle(pokemon.types,true)">{{
            pokemon.name
          }}</v-card-title>
          <v-card-subtitle class="types text-center">
            Typy: {{ getTypes(pokemon.types) }}
          </v-card-subtitle>
          <v-card-text>
            <p><strong>Wysokość:</strong> {{ pokemon.height }}</p>
            <p><strong>Waga:</strong> {{ pokemon.weight }}</p>
            <p><strong>Opis:</strong> {{ pokemon.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

interface Type {
  type: {
    name: string;
  };
}

interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}

interface Pokemon {
  name: string;
  height: number;
  weight: number;
  types: Type[];
  image: string;
  description: string;
}

const typeColors: Record<string, string> = {
  default: "#ccc",
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  normal: "#A8A878",
};

const fetchPokemon = async (): Promise<Pokemon[]> => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  if (!response.ok) {
    throw new Error("Błąd w odpowiedzi sieciowej");
  }

  const { results } = await response.json();

  const pokemonDetailsPromises = results.map(
    async (pokemon: { url: string }) => {
      const data = await fetch(pokemon.url).then((res) => res.json());

      const speciesResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${data.id}`
      );
      const speciesData: PokemonSpecies = await speciesResponse.json();
      const description =
        speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        )?.flavor_text || "Opis niedostępny";
      return {
        name: data.name,
        height: data.height,
        weight: data.weight,
        types: data.types,
        image: data.sprites.front_default,
        description: description,
      };
    }
  );

  return Promise.all(pokemonDetailsPromises);
};

const { data, isLoading, error } = useQuery<Pokemon[]>({
  queryKey: ["pokemon"],
  queryFn: fetchPokemon,
});

const getTypes = (types: Type[]): string => {
  return types.map((type) => type.type.name).join(", ");
};
const darkenColor = (color: string, amount: number) => {
  const colorWithoutHash = color.replace('#', '');
  const r = Math.max(0, parseInt(colorWithoutHash.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(colorWithoutHash.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(colorWithoutHash.substring(4, 6), 16) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
const getCardStyle = (types: Type[],solidColor:Boolean = false) => {
  const colors = types.map((type) => typeColors[type.type.name] || typeColors["default"]).filter(Boolean);
  const darkerColor = darkenColor(colors[0], 70);
  if(solidColor){
    return {
      borderTop: `dashed ${darkenColor(colors[0], -10)}`,
    };
  }
  if (colors.length === 0) return { backgroundColor: typeColors["default"] };
  const randomDeg = Math.random() > 0.7 ? 180 : Math.random() * 360;

  if (colors.length === 1) {
    return {
      background: `linear-gradient(${180*randomDeg}deg, ${colors[0]}, ${darkerColor})`,
    };
  } else if (colors.length > 1) {
    
    return {
      background: `linear-gradient(${randomDeg}deg, ${colors[0]}, ${colors[1]})`,
    };
  }
};
</script>

<style scoped>
.pokemon-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.pokemon-card {
  height: 25em;
  overflow: hidden;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}
.text-h6
{
  font-family: monospace;
  width: 100%;
  border-width: 2px;
}
</style>
