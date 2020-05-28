# Project of Data Visualization (COM-480)

[Guidelines](https://com-480-data-visualization.github.io/2020-project-guidelines/)

| Student's name | SCIPER |
| -------------- | ------ |
| Jeanne CHAVEROT | 246457 |
| Etienne CAQUOT | 249949 |
| Aslam CADER | 294112 |

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

The goal of this project is to show the impact of COVID-19 in Switzerland. <br>
This work has been done for the EPFL course **Data Visualization (COM-480)**.

We used [D3.js](https://d3js.org) for our visualizations. 

The repository is composed of 4 folders:

  - **data** This folder holds the original data-set [covid19-cases-switzerland-master](https://github.com/daenuprobst/covid19-cases-switzerland) from Daniel Probst. You can also find our main jupyter notebook  *data_cleaning* used to clean/format the data for our visualizations.
  - **docs** This folder contains our report for the 2nd and 3rd Milestone. The most interesting one is the [Process Book](docs/LCELO_milestone3_dataviz.pdf) for Milestone 3.
  - **pre-processing** This folder contains the jupyter notebook and text for Milestone1.
  - **website** In this folder you will find all the code related to the website. *index.html* is the html of the website. There are also 6 sub folders:
    - assets: contains the code from the framework we used for the website design
    - bubble_cloud: old folder form a visualization we decided not to include
    - data: the actual data used for the visualization, generate from *data_cleaning*
    - lib: the code for the libraries we used, Jquery, D3 and TopoJson.
    - scripts: the code we wrote for our visualizations, this includes:
      - *map.js* for the Switerland Map
      - *marimekko.js* for the hospital data with canton selection
      - *bar_chart.js* for the hospital data with overview of all cantons
    
You can have a look at the [website](https://com-480-data-visualization.github.io/com-480-project-lcelo/website/) containing our work. Or just click [here](youtube.com) to see the screen cast of the website with some explanations.

There are two sections in the website, one for the map and one for the hospitalization data. 
- **Map** You are able to choose the data to display with the three buttons *Cases*, *Deaths* and *Recovered*. You can display data in absolute value  with the *Absolute* button or as a percentage of the canton population with the button *Relative*.
There is a slider to choose a date to display the data. You can also press the *Play/Pause* button to see the evolution goes by itself. By moving you mouse over a canton you are able to see the three categories at once.
- **Hospital** This section has two visualizations, you are able to change between them by clicking on the *Overview* toggle button. The visualisation by default shows the hospitalization data for the selected canton. It is a marimekko plot where you can see the repartition of the three categories of hospitalization(normal,ICU,ventilation) and the width of the canton represents the total number of cases in the canton, the wider the rectangle the more hospitalization there are.<br>
When you click on the *Overview* button you get a visualization where all hospitalization data for all cantons is displayed. Like this we can have a better understanding of the situation. Note that the data is in absolute value. YOu can interact with the visualization by moving your mouse over a bart to have the numbers. As in the map there is a slider to choose a date to display the data. You can also press the *Play/Pause* button to see the evolution goes by itself.

- **Hospital** This section has two visualizations, you are able to change between them by clicking on the *Overview* toggle button. The visualisation by default shows the hospitalization data for the selected canton. It is a marimekko plot where you can see the repartition of the three categories of hospitalization(normal,ICU,ventilation) and the width of the canton represents the total number of cases in the canton, the wider the rectangle the more hospitalization there are.


All data is hosted on github and we used [GitHub pages](https://pages.github.com) to host the website.

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**

### Dataset

One big issue with choosing this subject is that we have only limited data: the virus started to spread officially from December 2019, and most of the dataset on the internet contains data from mid-January only.

Our datasets (this might be updated with further dataset):
1. Novel Corona Virus 2019 Dataset: https://www.kaggle.com/sudalairajkumar/novel-corona-virus-2019-dataset
2. COVID19 Cases Switzerland: https://www.kaggle.com/daenuprobst/covid19-cases-switzerland
3. COVID-19 Data Repository by Johns Hopkins CSSE https://github.com/CSSEGISandData/COVID-19


Data has been produced to be quickly usable so it has been well cleaned even if sometimes we can feel the lack of data and inconsistency over columns (not all rows contains all features).


We would also like to use APIs to provide real-time data (as much as possible) for some of the vizualizations:
1. API per country: https://rapidapi.com/collection/coronavirus-covid-19
2. API (35$ a month or web scraping):  https://www.worldometers.info/coronavirus/


### Problematic

COVID-19, SARS-Cov-2, Coronavirus are probably the most used words for the last few months and will be the hot topic for this beginning of 2020.
This new virus was discovered in Wuhan (China) in late 2019. It belongs to the coronavirus family and gives COVID-19 disease to humans. These disease symptoms are similar to flu but have more complications (eg. pneumonia). Being very virulent and extremely contagious, it's rapidly spreading and leads to thousands of deaths since hospitals are not able to provide respiratory support for needy patients. Since it's unknown to any human's immunity system, we need to contain the spreading to avoid deaths due to the lack of hospital equipment.

This course aims to learn to vizualize. It's not only about the vizualizations but also how to use them in a relevant manner to provide insights. We're all concerned by this virus Sars-Cov-2, and we are taking this opportunity to learn more about the impact of this virus on our world.

Our ambition is to implement a platform where you can observe the virus spread in the world over time. Not only providing numbers, but our goal is also to use interactive data vizualization techniques to allow the user to "feel" the data.

By "feel", we mean:
- raise consciousness about the virus, its dangerousness (symptoms/risk factors), prevention
- present facts about the number of deaths or recovered/confirmed patients across the world
- allow the user to compare data between countries and establish his own opinion
- find correlations between virus spread and other factors (eg. impact on the economy or other virus spread)


To sum up, we want to provide a data story that will lead to awareness, understanding, and acceptance with only facts.
We are targetting people that want to see the evolution of this pandemic but also people that are not following safety measures. Indeed, we hope our data story will help them change their behaviors to reduce the spread of the virus for the sake of hospital systems across the world.


### Exploratory Data Analysis

__Pre-processing of the data set you chose:
Show some basic statistics and get insights about the data:__


#### Dataset 1
- identify and remove vectors full of NaN
- for symptoms: some rows contain several symptoms together, we need to separate them to use that information
- we have a summary for 1086 patients (text) that we want to use for a  wordcloud visualization

Dataset 1 contains data for 171 countries. We have data for deaths/confirmed/recovered cases from 22nd January 2020 to 22nd March 2020 for now.

Looking closer to the data (COVID19_open_line_list.csv), we have lots of NaN for symptoms, sex, chronic disease,...

COVID19_line_list_data.csv contains data about patients but only 1'085 rows on this file.

#### Dataset 2
It contains the number of confirmed cases for all 26 cantons in Switzerland and is clean. They even have a general column for all the country (CH) which is good for trials.

Unfortunately, for now, we have data from the 6th March 2020 to 19th March 2020. We don't have data before it, but the dataset might get updated and we will be able to get the data after the 19th March 2020.

#### Dataset 3
This is a GitHub repository that contains several datasets. They're the ones that built the [COVID-19 situation dashboard for the World Health Organization (WHO)](https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd).

With daily updates from 22nd January 2020, this dataset contains data country by country, day by day, the number of confirmed/death/recovered/active cases.
Not only country by country, but we also have details for cities for bigger countries such as the US where we have details cities by cities (big cities). They provide also a column called __combined_Key__ which allows them to quickly look for cities.

This contains plenty of data, and we will need to determine which data we want to use and which we want to discard.

### Related work

__What others have already done with the data?__
- https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
- https://www.covidvisualizer.com
- http://coronaboard.ch
- https://www.corona-data.ch


__Why is our approach original?__

By combining measured **facts** with an **interactive** platform, we're being original. Indeed, it amplifies the cognition with the data and lots of the websites provide only counters and graphs for now which don't allow us to dive into the data. Moreover, we would like to measure its impact on other domains (we've considered only economical impact for now).


__What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).__
- http://bl.ocks.org/KoGor/5994804
- https://www.worldometers.info/coronavirus/coronavirus-cases/
- https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd
- https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6


## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**

[Milestone 2 Report describing the goal of the project](docs/LCELO_milestone2_dataviz.pdf)

[Website](https://com-480-data-visualization.github.io/com-480-project-lcelo/website/)
