# Manga API

API Manga bahasa Indonesia

# Usage

1. Clone this repository
   ```bash
   git clone https://github.com/letha11/manga-api.git
   ```
2. Install dependecies

   ```bash
   yarn
   # OR
   npm install
   ```

3. Start the development environment (\*if you haven't installed nodemon globally, you can do `npm install -g nodemon `

   ```bash
   npm run dev
   # OR
   npm run start
   ```

4. visit http://localhost:5000/api

# Documentation

**API PATH** = https://mangaoi.herokuapp.com/api/

## All Manga

Get All Manga

```
manga/filter/[pageNumber]
```

example : https://mangaoi.herokuapp.com/api/manga/filter/1

## Genres

```
genres/
```

example : https://mangaoi.herokuapp.com/api/genres/

you can see the value of genre, type, order, status. you can use it like this :

```
manga/filter/[pageNumber]?genre=[genreValue]&type=[typeValue]&order=[orderValue]&status=[statusValue]
```

example : https://mangaoi.herokuapp.com/api/manga/filter/1?genre=9&type=manhwa&order=popular&status=ongoing

that example above is going to search manga that have **genre of action** AND **comic type is manhwa** AND **order by popularity** AND **status is ongoing**
