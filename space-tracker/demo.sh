#!/bin/bash
# cURL demo of full CRUD on galaxies, stars and planets.
# Run on your Mac while `docker compose up` is running.
API=http://localhost:8080
J='Content-Type: application/json'

step() { echo; echo "===== $1"; }

step "CREATE galaxy"
curl -s -X POST $API/galaxies -H "$J" -d '{"name":"Milky Way","size":105700,"description":"Our home galaxy"}'; echo
step "CREATE two stars in that galaxy"
curl -s -X POST $API/stars -H "$J" -d '{"name":"Alpha Centauri A","size":2,"description":"Binary star A","galaxyId":1}'; echo
curl -s -X POST $API/stars -H "$J" -d '{"name":"Alpha Centauri B","size":1,"description":"Binary star B","galaxyId":1}'; echo
step "CREATE planet orbiting both stars (many-to-many through StarsPlanets)"
curl -s -X POST $API/planets -H "$J" -d '{"name":"Kepler-16b","size":8,"description":"Circumbinary planet","starIds":[1,2]}'; echo

step "READ all"
curl -s $API/galaxies; echo
curl -s $API/stars; echo
curl -s $API/planets; echo
step "READ one of each"
curl -s $API/galaxies/1; echo
curl -s $API/stars/1; echo
curl -s $API/planets/1; echo

step "UPDATE one of each"
curl -s -X PUT $API/galaxies/1 -H "$J" -d '{"description":"Barred spiral galaxy"}'; echo
curl -s -X PUT $API/stars/2 -H "$J" -d '{"size":3}'; echo
curl -s -X PUT $API/planets/1 -H "$J" -d '{"name":"Kepler-16b (Tatooine)"}'; echo

step "DELETE one of each, then confirm 404"
curl -s -o /dev/null -w "DELETE /planets/1 -> %{http_code}\n" -X DELETE $API/planets/1
curl -s -o /dev/null -w "GET    /planets/1 -> %{http_code}\n" $API/planets/1
curl -s -o /dev/null -w "DELETE /stars/2   -> %{http_code}\n" -X DELETE $API/stars/2
curl -s -o /dev/null -w "GET    /stars/2   -> %{http_code}\n" $API/stars/2
curl -s -X POST $API/galaxies -H "$J" -d '{"name":"Andromeda","size":220000,"description":"Nearest large galaxy"}'; echo
curl -s -o /dev/null -w "DELETE /galaxies/2 -> %{http_code}\n" -X DELETE $API/galaxies/2
curl -s -o /dev/null -w "GET    /galaxies/2 -> %{http_code}\n" $API/galaxies/2
