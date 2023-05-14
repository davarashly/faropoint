names_list = [
    "jeremy katz; gilad mor hayim",
    "Jeremy Katz",
    "doris pitilon; gilad mor hayim",
    "Doris Pitilon; Jeremy Katz",
]

def count_unique_names(names_list):
    unique_names = set()

    for name_string in names_list:
        names = [name.strip().lower() for name in name_string.split(';')]
        unique_names.update(names)

    return len(unique_names)

number_of_unique_names = count_unique_names(names_list)
print("Number of unique names:", number_of_unique_names)